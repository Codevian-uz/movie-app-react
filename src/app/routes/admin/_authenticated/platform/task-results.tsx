import { useState } from 'react'
import { keepPreviousData, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  type TaskResult,
  queuesQueryOptions,
  taskResultsQueryOptions,
  useCleanupResults,
} from '@/features/platform'
import { useTranslation } from '@/lib/i18n'
import { toDateTimeLocal } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../-route-guards'

export const Route = createFileRoute('/admin/_authenticated/platform/task-results')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.TASKMILL_VIEW)
  },
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: TaskResultsPage,
})

function TaskResultsPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const canManage = hasPermission(PERMISSIONS.TASKMILL_MANAGE)
  const { data: queues } = useSuspenseQuery(queuesQueryOptions())

  const [queueName, setQueueName] = useState('__all__')
  const [taskGroupId, setTaskGroupId] = useState('')
  const [committedTaskGroupId, setCommittedTaskGroupId] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [cleanupOpen, setCleanupOpen] = useState(false)

  const {
    data: results = [],
    isFetching,
    refetch,
  } = useQuery({
    ...taskResultsQueryOptions({
      queue_name: queueName === '__all__' ? undefined : queueName,
      task_group_id: committedTaskGroupId || undefined,
    }),
    placeholderData: keepPreviousData,
  })

  function handleSearch() {
    if (taskGroupId === committedTaskGroupId) {
      void refetch()
    } else {
      setCommittedTaskGroupId(taskGroupId)
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {t('platform.taskResults.title')}
        </h1>
        {canManage && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCleanupOpen(true)
            }}
          >
            {t('platform.taskResults.cleanupResults')}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={queueName} onValueChange={setQueueName}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('platform.taskResults.queueName')} />
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
          placeholder={t('platform.taskResults.taskGroupId')}
          value={taskGroupId}
          onChange={(e) => {
            setTaskGroupId(e.target.value)
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

      {results.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('platform.taskResults.noResults')}
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
                <TableHead>{t('platform.taskResults.queueName')}</TableHead>
                <TableHead>{t('platform.taskResults.taskGroupId')}</TableHead>
                <TableHead>{t('platform.taskResults.operationId')}</TableHead>
                <TableHead>{t('platform.taskResults.attempts')}</TableHead>
                <TableHead>{t('platform.taskResults.scheduledAt')}</TableHead>
                <TableHead>{t('platform.taskResults.completedAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TaskResultRow
                  key={result.id}
                  result={result}
                  expanded={expandedRows.has(result.id)}
                  onToggle={() => {
                    toggleRow(result.id)
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CleanupDialog open={cleanupOpen} onOpenChange={setCleanupOpen} queues={queues} />
    </div>
  )
}

function TaskResultRow({
  result,
  expanded,
  onToggle,
}: {
  result: TaskResult
  expanded: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()

  return (
    <>
      <TableRow className="cursor-pointer" onClick={onToggle}>
        <TableCell className="w-8 px-2">
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </TableCell>
        <TableCell className="font-mono text-xs">{result.id}</TableCell>
        <TableCell>{result.queue_name}</TableCell>
        <TableCell className="font-mono text-xs">{result.task_group_id || '—'}</TableCell>
        <TableCell className="font-mono text-xs">{result.operation_id}</TableCell>
        <TableCell className="text-center">{result.attempts}</TableCell>
        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
          {new Date(result.scheduled_at).toLocaleString()}
        </TableCell>
        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
          {new Date(result.completed_at).toLocaleString()}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/50 space-y-3 p-4">
            <div>
              <div className="mb-1 text-sm font-medium">{t('platform.taskResults.payload')}</div>
              <pre className="bg-background overflow-auto rounded-md border p-3 text-xs">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

function CleanupDialog({
  open,
  onOpenChange,
  queues,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  queues: string[]
}) {
  const { t } = useTranslation()
  const cleanup = useCleanupResults()
  const [date, setDate] = useState(() =>
    toDateTimeLocal(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
  )
  const [queueName, setQueueName] = useState('__all__')
  const [deletedCount, setDeletedCount] = useState<number | null>(null)

  function onCleanup() {
    if (!date) {
      return
    }
    cleanup.mutate(
      {
        completedBefore: new Date(date).toISOString(),
        queueName: queueName === '__all__' ? undefined : queueName,
      },
      {
        onSuccess: (data) => {
          setDeletedCount(data.deleted_count)
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setDeletedCount(null)
          setDate(toDateTimeLocal(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
          setQueueName('__all__')
        }
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('platform.taskResults.cleanupResults')}</DialogTitle>
          <DialogDescription>{t('platform.taskResults.cleanupBefore')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="datetime-local"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
            }}
          />
          <Select value={queueName} onValueChange={setQueueName}>
            <SelectTrigger>
              <SelectValue placeholder={t('common.labels.all')} />
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
          {deletedCount !== null && (
            <p className="text-sm font-medium">
              {t('platform.taskResults.deletedCount').replace('{count}', String(deletedCount))}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onCleanup} disabled={!date || cleanup.isPending}>
            {t('common.actions.cleanup')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
