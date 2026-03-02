import { useQueries, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Activity, AlertCircle, Calendar, Hash, Server, Users } from 'lucide-react'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authStatsQueryOptions } from '@/features/auth'
import {
  errorStatsQueryOptions,
  queuesQueryOptions,
  queueStatsQueryOptions,
  schedulesQueryOptions,
} from '@/features/platform'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/types/permissions'

export const Route = createFileRoute('/admin/_authenticated/')({
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)

  // Auth Stats
  const { data: authStats } = useQuery({
    ...authStatsQueryOptions(),
    enabled: hasPermission(PERMISSIONS.USER_READ),
  })

  // Tasks
  const { data: schedules } = useQuery({
    ...schedulesQueryOptions(),
    enabled: hasPermission(PERMISSIONS.TASKMILL_VIEW),
  })

  const { data: queues } = useQuery({
    ...queuesQueryOptions(),
    enabled: hasPermission(PERMISSIONS.TASKMILL_VIEW),
  })

  const queueStatsQueries = useQueries({
    queries: (queues ?? []).map((queueName) => queueStatsQueryOptions(queueName)),
  })

  const totalDlqItems = queueStatsQueries.reduce((acc, q) => {
    return acc + (q.data?.in_dlq ?? 0)
  }, 0)

  const queuesHealthText = Array.isArray(queues)
    ? totalDlqItems > 0
      ? `${String(queues.length)} queues / ${String(totalDlqItems)} in DLQ`
      : `${String(queues.length)} queues`
    : '-'

  // Errors
  const { data: errorStats } = useQuery({
    ...errorStatsQueryOptions(),
    enabled: hasPermission(PERMISSIONS.ALERT_VIEW),
  })

  const topOperations = (errorStats?.by_operation ?? []).slice(0, 3)
  const topCodes = (errorStats?.by_code ?? []).slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{t('dashboard.title')}</h1>
      <p className="text-muted-foreground text-sm">{t('dashboard.welcome')}</p>

      {/* Auth Stats */}
      {hasPermission(PERMISSIONS.USER_READ) && (
        <div>
          <h2 className="text-muted-foreground mb-3 text-sm font-medium">
            {t('dashboard.authStats')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-normal">
                  {t('dashboard.totalUsers')}
                </CardTitle>
                <Users className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{authStats?.total_users ?? '-'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-normal">
                  {t('dashboard.totalRoles')}
                </CardTitle>
                <Hash className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{authStats?.total_roles ?? '-'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-normal">
                  {t('dashboard.activeSessions')}
                </CardTitle>
                <Activity className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{authStats?.active_sessions ?? '-'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tasks */}
      {hasPermission(PERMISSIONS.TASKMILL_VIEW) && (
        <div>
          <h2 className="text-muted-foreground mb-3 text-sm font-medium">{t('dashboard.tasks')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-normal">
                  {t('dashboard.taskSchedules')}
                </CardTitle>
                <Calendar className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(schedules?.length ?? 0) > 0 ? String(schedules?.length) : '-'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-normal">
                  {t('dashboard.queuesHealth')}
                </CardTitle>
                <Server className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${totalDlqItems > 0 ? 'text-destructive' : ''}`}>
                  {queuesHealthText}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Errors */}
      {hasPermission(PERMISSIONS.ALERT_VIEW) && (
        <div>
          <h2 className="text-muted-foreground mb-3 text-sm font-medium">
            {t('dashboard.errors')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-normal">
                  {t('dashboard.totalErrors')}
                </CardTitle>
                <AlertCircle className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{errorStats?.total_count ?? '-'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-normal">
                  {t('dashboard.byOperation')}
                </CardTitle>
                <Hash className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                {topOperations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">—</p>
                ) : (
                  <div className="space-y-1">
                    {topOperations.map((item) => (
                      <div
                        key={item.operation}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground truncate">{item.operation}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-normal">
                  {t('dashboard.byCode')}
                </CardTitle>
                <Hash className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                {topCodes.length === 0 ? (
                  <p className="text-muted-foreground text-sm">—</p>
                ) : (
                  <div className="space-y-1">
                    {topCodes.map((item) => (
                      <div key={item.code} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate">{item.code}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
