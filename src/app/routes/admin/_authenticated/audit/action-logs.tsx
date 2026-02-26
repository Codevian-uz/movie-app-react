import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, ChevronRight, Filter } from 'lucide-react'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { TablePagination } from '@/components/TablePagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DEFAULT_PAGE_SIZE } from '@/config/constants'
import { actionLogsQueryOptions, type ActionLog } from '@/features/audit'
import { useTranslation } from '@/lib/i18n'
import { toDateTimeLocal } from '@/lib/utils'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../-route-guards'

export const Route = createFileRoute('/admin/_authenticated/audit/action-logs')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.ACTION_LOG_READ)
  },
  validateSearch: (search: Record<string, unknown>) => {
    const actionLogId =
      typeof search.actionLogId === 'number'
        ? search.actionLogId
        : typeof search.actionLogId === 'string' && !Number.isNaN(Number(search.actionLogId))
          ? Number(search.actionLogId)
          : undefined

    return actionLogId === undefined ? {} : { actionLogId }
  },
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: ActionLogsPage,
})

function getDefaultDateRange() {
  const to = new Date()
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000)
  return {
    from: toDateTimeLocal(from),
    to: toDateTimeLocal(to),
  }
}

function parseDateTimeLocal(value: string): string | undefined {
  if (value === '') {
    return undefined
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString()
}

function ActionLogsPage() {
  const { t } = useTranslation()
  const { actionLogId: searchActionLogId } = Route.useSearch()
  const routeNavigate = Route.useNavigate()
  const defaultRange = getDefaultDateRange()
  const [from, setFrom] = useState(defaultRange.from)
  const [to, setTo] = useState(defaultRange.to)
  const [module, setModule] = useState('')
  const [operationId, setOperationId] = useState('')
  const [userId, setUserId] = useState('')
  const [groupKey, setGroupKey] = useState('')
  const [actionLogId, setActionLogId] = useState(searchActionLogId?.toString() ?? '')
  const [cursor, setCursor] = useState<number | undefined>(undefined)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [allLogs, setAllLogs] = useState<ActionLog[]>([])
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [committedModule, setCommittedModule] = useState('')
  const [committedOperationId, setCommittedOperationId] = useState('')
  const [committedUserId, setCommittedUserId] = useState('')
  const [committedGroupKey, setCommittedGroupKey] = useState('')

  useEffect(() => {
    setActionLogId(searchActionLogId?.toString() ?? '')
  }, [searchActionLogId])

  useEffect(() => {
    setCursor(undefined)
    setAllLogs([])
  }, [committedModule, committedOperationId, committedUserId, committedGroupKey, pageSize])

  const fromIso = parseDateTimeLocal(from)
  const toIso = parseDateTimeLocal(to)
  const hasValidDateRange = fromIso !== undefined && toIso !== undefined

  const parsedActionLogId = Number(actionLogId)
  const hasActionLogFilter = actionLogId !== '' && !Number.isNaN(parsedActionLogId)

  const params = {
    from: fromIso ?? new Date(defaultRange.from).toISOString(),
    to: toIso ?? new Date(defaultRange.to).toISOString(),
    module: committedModule || undefined,
    operation_id: committedOperationId || undefined,
    user_id: committedUserId || undefined,
    group_key: committedGroupKey || undefined,
    cursor,
    limit: pageSize,
  }

  const { data: logs = [], refetch } = useQuery({
    ...actionLogsQueryOptions(params),
    enabled: hasValidDateRange,
  })

  const displayLogs = cursor === undefined ? logs : [...allLogs, ...logs]
  const filteredLogs = hasActionLogFilter
    ? displayLogs.filter((log) => log.id === parsedActionLogId)
    : displayLogs

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

  function loadMore() {
    const lastLog = displayLogs[displayLogs.length - 1]
    if (lastLog) {
      setAllLogs(displayLogs)
      setCursor(lastLog.id)
    }
  }

  function resetSearch() {
    setCursor(undefined)
    setAllLogs([])
  }

  function handleFilterSearch() {
    const changed =
      module !== committedModule ||
      operationId !== committedOperationId ||
      userId !== committedUserId ||
      groupKey !== committedGroupKey
    if (changed) {
      setCommittedModule(module)
      setCommittedOperationId(operationId)
      setCommittedUserId(userId)
      setCommittedGroupKey(groupKey)
    } else {
      void refetch()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
        {t('audit.actionLogs.title')}
      </h1>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t('audit.actionLogs.from')}</label>
            <Input
              type="datetime-local"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                resetSearch()
              }}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t('audit.actionLogs.to')}</label>
            <Input
              type="datetime-local"
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                resetSearch()
              }}
              className="w-auto"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFiltersOpen(!filtersOpen)
            }}
          >
            <Filter className="mr-2 size-4" />
            {t('common.actions.filter')}
          </Button>
        </div>

        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleContent>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Input
                placeholder={t('audit.actionLogs.module')}
                value={module}
                onChange={(e) => {
                  setModule(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFilterSearch()
                  }
                }}
                className="w-40"
              />
              <Input
                placeholder={t('audit.actionLogs.operationId')}
                value={operationId}
                onChange={(e) => {
                  setOperationId(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFilterSearch()
                  }
                }}
                className="w-48"
              />
              <Input
                placeholder={t('audit.actionLogs.userId')}
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFilterSearch()
                  }
                }}
                className="w-48"
              />
              <Input
                placeholder={t('audit.actionLogs.groupKey')}
                value={groupKey}
                onChange={(e) => {
                  setGroupKey(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFilterSearch()
                  }
                }}
                className="w-40"
              />
              <Input
                placeholder={t('audit.statusChanges.actionLogId')}
                value={actionLogId}
                onChange={(e) => {
                  const nextValue = e.target.value
                  setActionLogId(nextValue)
                  resetSearch()
                  void routeNavigate({
                    search:
                      nextValue !== '' && !Number.isNaN(Number(nextValue))
                        ? { actionLogId: Number(nextValue) }
                        : {},
                  })
                }}
                className="w-40"
              />
              <Button variant="outline" size="sm" onClick={handleFilterSearch}>
                {t('common.actions.search')}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {!hasValidDateRange ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('audit.actionLogs.invalidDateRange')}
        </p>
      ) : filteredLogs.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('audit.actionLogs.noLogs')}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>{t('audit.actionLogs.timestamp')}</TableHead>
                  <TableHead>{t('audit.actionLogs.userId')}</TableHead>
                  <TableHead>{t('audit.actionLogs.module')}</TableHead>
                  <TableHead>{t('audit.actionLogs.operationId')}</TableHead>
                  <TableHead>{t('audit.actionLogs.tags')}</TableHead>
                  <TableHead>{t('audit.actionLogs.ipAddress')}</TableHead>
                  <TableHead>{t('audit.actionLogs.traceId')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <ActionLogRow
                    key={log.id}
                    log={log}
                    expanded={expandedRows.has(log.id)}
                    onToggle={() => {
                      toggleRow(log.id)
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCursor(undefined)
              setAllLogs([])
            }}
          />

          {logs.length >= pageSize && !hasActionLogFilter && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={loadMore}>
                {t('common.actions.loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ActionLogRow({
  log,
  expanded,
  onToggle,
}: {
  log: ActionLog
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
        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
          {new Date(log.created_at).toLocaleString()}
        </TableCell>
        <TableCell className="font-mono text-xs whitespace-nowrap">{log.user_id ?? '-'}</TableCell>
        <TableCell>{log.module}</TableCell>
        <TableCell className="font-mono text-xs">{log.operation_id}</TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {log.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
        <TableCell className="font-mono text-xs whitespace-nowrap">{log.trace_id}</TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/50 p-4">
            <div className="mb-1 text-sm font-medium">{t('audit.actionLogs.requestPayload')}</div>
            <pre className="bg-background overflow-auto rounded-md border p-3 text-xs">
              {JSON.stringify(log.request_payload, null, 2)}
            </pre>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
