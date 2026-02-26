import { useState } from 'react'
import { keepPreviousData, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  type DLQTask,
  queuesQueryOptions,
  dlqTasksQueryOptions,
  useRequeueFromDlq,
} from '@/features/platform'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../-route-guards'

export const Route = createFileRoute('/admin/_authenticated/platform/dlq')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.TASKMILL_VIEW)
  },
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: DlqPage,
})

function DlqPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const canManage = hasPermission(PERMISSIONS.TASKMILL_MANAGE)
  const { data: queues } = useSuspenseQuery(queuesQueryOptions())

  const [queueName, setQueueName] = useState('__all__')
  const [operationId, setOperationId] = useState('')
  const [committedOperationId, setCommittedOperationId] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [requeueId, setRequeueId] = useState<number | null>(null)

  const {
    data: tasks = [],
    isFetching,
    refetch,
  } = useQuery({
    ...dlqTasksQueryOptions({
      queue_name: queueName === '__all__' ? undefined : queueName,
      operation_id: committedOperationId || undefined,
    }),
    placeholderData: keepPreviousData,
  })

  const requeue = useRequeueFromDlq()

  function handleSearch() {
    if (operationId === committedOperationId) {
      void refetch()
    } else {
      setCommittedOperationId(operationId)
    }
  }

  function toggleRow(id: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function onRequeue() {
    if (requeueId === null) {
      return
    }
    requeue.mutate(requeueId, {
      onSuccess: () => {
        toast.success(t('platform.dlq.requeued'))
        setRequeueId(null)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
        {t('platform.dlq.title')}
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={queueName} onValueChange={setQueueName}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('platform.dlq.queueName')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t('common.labels.all')}</SelectItem>
            {queues.map((q) => (
              <SelectItem key={q} value={q}>
                {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder={t('platform.dlq.operationId')}
          value={operationId}
          onChange={(e) => {
            setOperationId(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className="max-w-48"
        />
        <Button variant="outline" size="sm" onClick={handleSearch}>
          {t('common.actions.search')}
        </Button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('platform.dlq.noTasks')}
        </p>
      ) : (
        <div
          className={`overflow-x-auto rounded-md border transition-opacity ${isFetching ? 'opacity-50' : ''}`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>{t('common.labels.id')}</TableHead>
                <TableHead>{t('platform.dlq.queueName')}</TableHead>
                <TableHead>{t('platform.dlq.operationId')}</TableHead>
                <TableHead>{t('platform.dlq.error')}</TableHead>
                <TableHead>{t('platform.dlq.attempts')}</TableHead>
                <TableHead>{t('platform.dlq.dlqAt')}</TableHead>
                {canManage && <TableHead className="w-24" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <DlqRow
                  key={task.id}
                  task={task}
                  expanded={expandedRows.has(task.id)}
                  onToggle={() => {
                    toggleRow(task.id)
                  }}
                  canManage={canManage}
                  onRequeue={() => {
                    setRequeueId(task.id)
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={requeueId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRequeueId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('platform.dlq.requeueConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onRequeue} disabled={requeue.isPending}>
              {t('common.actions.requeue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function DlqRow({
  task,
  expanded,
  onToggle,
  canManage,
  onRequeue,
}: {
  task: DLQTask
  expanded: boolean
  onToggle: () => void
  canManage: boolean
  onRequeue: () => void
}) {
  const { t } = useTranslation()

  return (
    <>
      <TableRow className="cursor-pointer" onClick={onToggle}>
        <TableCell className="w-8 px-2">
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </TableCell>
        <TableCell className="font-mono text-xs">{task.id}</TableCell>
        <TableCell>{task.queue_name}</TableCell>
        <TableCell className="font-mono text-xs">{task.operation_id}</TableCell>
        <TableCell className="max-w-xs truncate text-sm">
          {task.dlq_reason !== null && task.dlq_reason !== undefined
            ? JSON.stringify(task.dlq_reason).slice(0, 80)
            : task.error}
        </TableCell>
        <TableCell>{task.attempts}</TableCell>
        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
          {new Date(task.dlq_at).toLocaleString()}
        </TableCell>
        {canManage && (
          <TableCell>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRequeue()
              }}
            >
              {t('common.actions.requeue')}
            </Button>
          </TableCell>
        )}
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={canManage ? 8 : 7} className="bg-muted/50 space-y-3 p-4">
            <div>
              <div className="mb-1 text-sm font-medium">{t('platform.dlq.payload')}</div>
              <pre className="bg-background overflow-auto rounded-md border p-3 text-xs">
                {JSON.stringify(task.payload, null, 2)}
              </pre>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium">{t('platform.dlq.error')}</div>
              <pre className="bg-background overflow-auto rounded-md border p-3 text-xs">
                {task.dlq_reason !== null && task.dlq_reason !== undefined
                  ? JSON.stringify(task.dlq_reason, null, 2)
                  : task.error}
              </pre>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
