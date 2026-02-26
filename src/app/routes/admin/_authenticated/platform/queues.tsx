import { useState } from 'react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  queuesQueryOptions,
  queueStatsQueryOptions,
  usePurgeQueue,
  usePurgeDlq,
} from '@/features/platform'
import { useTranslation } from '@/lib/i18n'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../-route-guards'

export const Route = createFileRoute('/admin/_authenticated/platform/queues')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.TASKMILL_VIEW)
  },
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: QueuesPage,
})

function QueuesPage() {
  const { t } = useTranslation()
  const { data: queues } = useSuspenseQuery(queuesQueryOptions())

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {t('platform.queues.title')}
        </h1>
        <span className="text-muted-foreground text-xs">
          {t('common.labels.lastUpdated')}: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {queues.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('platform.queues.noQueues')}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {queues.map((queueName) => (
            <QueueCard key={queueName} queueName={queueName} />
          ))}
        </div>
      )}
    </div>
  )
}

function QueueCard({ queueName }: { queueName: string }) {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const canManage = hasPermission(PERMISSIONS.TASKMILL_MANAGE)
  const { data: stats } = useQuery(queueStatsQueryOptions(queueName))

  const purgeQueue = usePurgeQueue()
  const purgeDlq = usePurgeDlq()
  const [purgeTarget, setPurgeTarget] = useState<'queue' | 'dlq' | null>(null)

  function onConfirmPurge() {
    if (!purgeTarget) {
      return
    }
    const mutation = purgeTarget === 'queue' ? purgeQueue : purgeDlq
    mutation.mutate(queueName, {
      onSuccess: () => {
        toast.success(
          purgeTarget === 'queue' ? t('platform.queues.purgeQueue') : t('platform.queues.purgeDlq'),
        )
        setPurgeTarget(null)
      },
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{queueName}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">{t('platform.queues.available')}</span>
                <p className="font-medium">{stats.available}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('platform.queues.inFlight')}</span>
                <p className="font-medium">{stats.in_flight}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('platform.queues.scheduled')}</span>
                <p className="font-medium">{stats.scheduled}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('platform.queues.inDlq')}</span>
                <p className={`font-medium ${stats.in_dlq > 0 ? 'text-destructive' : ''}`}>
                  {stats.in_dlq}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('platform.queues.avgAttempts')}</span>
                <p className="font-medium">{stats.avg_attempts.toFixed(1)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('platform.queues.p95Attempts')}</span>
                <p className="font-medium">{stats.p95_attempts}</p>
              </div>
              {stats.oldest_task !== undefined && stats.oldest_task !== '' && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">{t('platform.queues.oldestTask')}</span>
                  <p className="font-medium">{formatRelativeTime(stats.oldest_task)}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{t('common.labels.loading')}</p>
          )}
        </CardContent>
        {canManage && (
          <CardFooter className="gap-2 pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPurgeTarget('queue')
              }}
            >
              {t('platform.queues.purgeQueue')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPurgeTarget('dlq')
              }}
            >
              {t('platform.queues.purgeDlq')}
            </Button>
          </CardFooter>
        )}
      </Card>

      <AlertDialog
        open={purgeTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPurgeTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {purgeTarget === 'queue'
                ? t('platform.queues.purgeConfirm')
                : t('platform.queues.purgeDlqConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmPurge}
              disabled={purgeQueue.isPending || purgeDlq.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.actions.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
