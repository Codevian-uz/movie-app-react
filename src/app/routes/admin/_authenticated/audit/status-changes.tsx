import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Filter } from 'lucide-react'
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
import { statusChangeLogsQueryOptions, type StatusChangeLog } from '@/features/audit'
import { useTranslation } from '@/lib/i18n'
import { toDateTimeLocal } from '@/lib/utils'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../-route-guards'

export const Route = createFileRoute('/admin/_authenticated/audit/status-changes')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.STATUS_CHANGE_LOG_READ)
  },
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: StatusChangesPage,
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

function StatusChangesPage() {
  const { t } = useTranslation()
  const defaultRange = getDefaultDateRange()
  const [from, setFrom] = useState(defaultRange.from)
  const [to, setTo] = useState(defaultRange.to)
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [actionLogId, setActionLogId] = useState('')
  const [cursor, setCursor] = useState<number | undefined>(undefined)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [allLogs, setAllLogs] = useState<StatusChangeLog[]>([])
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [committedEntityType, setCommittedEntityType] = useState('')
  const [committedEntityId, setCommittedEntityId] = useState('')
  const [committedActionLogId, setCommittedActionLogId] = useState('')

  useEffect(() => {
    setCursor(undefined)
    setAllLogs([])
  }, [committedEntityType, committedEntityId, committedActionLogId, pageSize])

  const fromIso = parseDateTimeLocal(from)
  const toIso = parseDateTimeLocal(to)
  const hasValidDateRange = fromIso !== undefined && toIso !== undefined

  const params = {
    from: fromIso ?? new Date(defaultRange.from).toISOString(),
    to: toIso ?? new Date(defaultRange.to).toISOString(),
    entity_type: committedEntityType || undefined,
    entity_id: committedEntityId || undefined,
    action_log_id:
      committedActionLogId !== '' && !Number.isNaN(Number(committedActionLogId))
        ? Number(committedActionLogId)
        : undefined,
    cursor,
    limit: pageSize,
  }

  const { data: logs = [], refetch } = useQuery({
    ...statusChangeLogsQueryOptions(params),
    enabled: hasValidDateRange,
  })

  const displayLogs = cursor === undefined ? logs : [...allLogs, ...logs]

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
      entityType !== committedEntityType ||
      entityId !== committedEntityId ||
      actionLogId !== committedActionLogId
    if (changed) {
      setCommittedEntityType(entityType)
      setCommittedEntityId(entityId)
      setCommittedActionLogId(actionLogId)
    } else {
      void refetch()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
        {t('audit.statusChanges.title')}
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
                placeholder={t('audit.statusChanges.entityType')}
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFilterSearch()
                  }
                }}
                className="w-40"
              />
              <Input
                placeholder={t('audit.statusChanges.entityId')}
                value={entityId}
                onChange={(e) => {
                  setEntityId(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFilterSearch()
                  }
                }}
                className="w-48"
              />
              <Input
                placeholder={t('audit.statusChanges.actionLogId')}
                value={actionLogId}
                onChange={(e) => {
                  setActionLogId(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFilterSearch()
                  }
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
      ) : displayLogs.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('audit.statusChanges.noLogs')}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('audit.statusChanges.timestamp')}</TableHead>
                  <TableHead>{t('audit.statusChanges.entityType')}</TableHead>
                  <TableHead>{t('audit.statusChanges.entityId')}</TableHead>
                  <TableHead>{t('audit.statusChanges.status')}</TableHead>
                  <TableHead>{t('audit.statusChanges.actionLogId')}</TableHead>
                  <TableHead>{t('audit.statusChanges.traceId')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.entity_type}</TableCell>
                    <TableCell className="font-mono text-xs">{log.entity_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        to="/admin/audit/action-logs"
                        search={{ actionLogId: log.action_log_id }}
                        className="text-primary text-sm underline-offset-4 hover:underline"
                      >
                        {log.action_log_id}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-20 truncate font-mono text-xs">
                      {log.trace_id}
                    </TableCell>
                  </TableRow>
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

          {logs.length >= pageSize && (
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
