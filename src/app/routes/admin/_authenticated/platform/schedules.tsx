import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { schedulesQueryOptions, useTriggerSchedule } from '@/features/platform'
import { useTranslation } from '@/lib/i18n'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../-route-guards'

export const Route = createFileRoute('/admin/_authenticated/platform/schedules')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.TASKMILL_VIEW)
  },
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: SchedulesPage,
})

function SchedulesPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const canManage = hasPermission(PERMISSIONS.TASKMILL_MANAGE)
  const { data: schedules } = useSuspenseQuery(schedulesQueryOptions())
  const trigger = useTriggerSchedule()
  const [triggerOp, setTriggerOp] = useState<string | null>(null)

  function onTrigger() {
    if (triggerOp === null) {
      return
    }
    trigger.mutate(triggerOp, {
      onSuccess: () => {
        toast.success(t('platform.schedules.triggered'))
        setTriggerOp(null)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
        {t('platform.schedules.title')}
      </h1>

      {schedules.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('platform.schedules.noSchedules')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('platform.schedules.operationId')}</TableHead>
                <TableHead>{t('platform.schedules.queueName')}</TableHead>
                <TableHead>{t('platform.schedules.cronExpression')}</TableHead>
                <TableHead>{t('platform.schedules.nextRun')}</TableHead>
                <TableHead>{t('platform.schedules.lastRun')}</TableHead>
                <TableHead>{t('common.labels.status')}</TableHead>
                {canManage && <TableHead className="w-28" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.operation_id}>
                  <TableCell className="font-mono text-xs">{schedule.operation_id}</TableCell>
                  <TableCell>{schedule.queue_name}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <code className="text-xs">{schedule.cron_pattern}</code>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{schedule.cron_pattern}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(schedule.next_run_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatRelativeTime(schedule.last_run_at)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={schedule.last_run_status === 'success' ? 'default' : 'secondary'}
                    >
                      {schedule.last_run_status ?? '-'}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTriggerOp(schedule.operation_id)
                        }}
                      >
                        {t('platform.schedules.triggerNow')}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={triggerOp !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTriggerOp(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('platform.schedules.triggerConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onTrigger} disabled={trigger.isPending}>
              {t('common.actions.trigger')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
