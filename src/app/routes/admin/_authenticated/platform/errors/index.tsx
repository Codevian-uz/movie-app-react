import { memo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { TablePagination } from '@/components/TablePagination'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DEFAULT_PAGE_SIZE } from '@/config/constants'
import { type AlertError, errorsQueryOptions, useCleanupErrors } from '@/features/platform'
import { useTranslation } from '@/lib/i18n'
import { toDateTimeLocal } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../../-route-guards'
import { parseErrorsListSearch } from './-search'

export const Route = createFileRoute('/admin/_authenticated/platform/errors/')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.ALERT_VIEW)
  },
  validateSearch: parseErrorsListSearch,
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: ErrorsPage,
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

function ErrorsPage() {
  const { t } = useTranslation()
  const routeNavigate = Route.useNavigate()
  const routeSearch = Route.useSearch()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const canManage = hasPermission(PERMISSIONS.ALERT_MANAGE)
  const defaultRange = getDefaultDateRange()

  const from = routeSearch.from ?? defaultRange.from
  const to = routeSearch.to ?? defaultRange.to
  const page = routeSearch.page ?? 1
  const currentPageSize = routeSearch.pageSize ?? DEFAULT_PAGE_SIZE

  const [code, setCode] = useState(routeSearch.code ?? '')
  const [service, setService] = useState(routeSearch.service ?? '')
  const [operation, setOperation] = useState(routeSearch.operation ?? '')
  const [search, setSearch] = useState(routeSearch.search ?? '')
  const [cleanupOpen, setCleanupOpen] = useState(false)

  const [committedCode, setCommittedCode] = useState(routeSearch.code ?? '')
  const [committedService, setCommittedService] = useState(routeSearch.service ?? '')
  const [committedOperation, setCommittedOperation] = useState(routeSearch.operation ?? '')
  const [committedSearch, setCommittedSearch] = useState(routeSearch.search ?? '')

  const fromIso = parseDateTimeLocal(from)
  const toIso = parseDateTimeLocal(to)

  const { data, refetch } = useQuery(
    errorsQueryOptions({
      code: committedCode || undefined,
      service: committedService || undefined,
      operation: committedOperation || undefined,
      search: committedSearch || undefined,
      created_from: fromIso,
      created_to: toIso,
      page_number: page,
      page_size: currentPageSize,
    }),
  )

  function handleSearch() {
    const changed =
      code !== committedCode ||
      service !== committedService ||
      operation !== committedOperation ||
      search !== committedSearch
    if (changed) {
      setCommittedCode(code)
      setCommittedService(service)
      setCommittedOperation(operation)
      setCommittedSearch(search)
      void routeNavigate({
        search: (prev) => ({
          ...prev,
          code: code === '' ? undefined : code,
          service: service === '' ? undefined : service,
          operation: operation === '' ? undefined : operation,
          search: search === '' ? undefined : search,
          page: undefined,
        }),
      })
    } else {
      void refetch()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
        {t('platform.errors.title')}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder={t('platform.errors.code')}
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className="w-32"
        />
        <Input
          placeholder={t('platform.errors.service')}
          value={service}
          onChange={(e) => {
            setService(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className="w-32"
        />
        <Input
          placeholder={t('platform.errors.operation')}
          value={operation}
          onChange={(e) => {
            setOperation(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className="w-40"
        />
        <Input
          placeholder={t('common.actions.search')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className="w-48"
        />
        <Button variant="outline" size="sm" onClick={handleSearch}>
          {t('common.actions.search')}
        </Button>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t('audit.actionLogs.from')}</label>
          <Input
            type="datetime-local"
            value={from}
            onChange={(e) => {
              const nextValue = e.target.value
              void routeNavigate({
                search: (prev) => ({
                  ...prev,
                  from: nextValue === '' ? undefined : nextValue,
                  page: undefined,
                }),
              })
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
              const nextValue = e.target.value
              void routeNavigate({
                search: (prev) => ({
                  ...prev,
                  to: nextValue === '' ? undefined : nextValue,
                  page: undefined,
                }),
              })
            }}
            className="w-auto"
          />
        </div>
        {canManage && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCleanupOpen(true)
            }}
          >
            {t('platform.errors.cleanupErrors')}
          </Button>
        )}
      </div>

      <ErrorsTableSection
        errors={data?.content ?? []}
        totalCount={data?.count}
        page={page}
        pageSize={currentPageSize}
        routeSearch={routeSearch}
      />

      <CleanupErrorsDialog open={cleanupOpen} onOpenChange={setCleanupOpen} />
    </div>
  )
}

// --- Errors Table Section (memoized to prevent re-renders during filter typing) ---

interface ErrorsTableSectionProps {
  errors: AlertError[]
  totalCount: number | undefined
  page: number
  pageSize: number
  routeSearch: Record<string, unknown>
}

const ErrorsTableSection = memo(function ErrorsTableSection({
  errors,
  totalCount,
  page,
  pageSize,
  routeSearch,
}: ErrorsTableSectionProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const routeNavigate = Route.useNavigate()

  return (
    <>
      {errors.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('platform.errors.noErrors')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('platform.errors.code')}</TableHead>
                <TableHead>{t('platform.errors.message')}</TableHead>
                <TableHead>{t('platform.errors.service')}</TableHead>
                <TableHead>{t('platform.errors.operation')}</TableHead>
                <TableHead>{t('platform.errors.alerted')}</TableHead>
                <TableHead>{t('platform.errors.createdAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.map((error) => (
                <TableRow
                  key={error.id}
                  className="cursor-pointer"
                  onClick={() => {
                    void navigate({
                      to: '/admin/platform/errors/$errorId',
                      params: { errorId: error.id },
                      search: routeSearch,
                    })
                  }}
                >
                  <TableCell className="font-mono text-xs">{error.code}</TableCell>
                  <TableCell className="max-w-xs truncate">{error.message}</TableCell>
                  <TableCell>{error.service}</TableCell>
                  <TableCell className="font-mono text-xs">{error.operation}</TableCell>
                  <TableCell>
                    {error.alerted ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(error.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={(p) => {
          void routeNavigate({
            search: (prev) => ({
              ...prev,
              page: p > 1 ? p : undefined,
            }),
          })
        }}
        onPageSizeChange={(size) => {
          void routeNavigate({
            search: (prev) => ({
              ...prev,
              pageSize: size !== DEFAULT_PAGE_SIZE ? size : undefined,
              page: undefined,
            }),
          })
        }}
      />
    </>
  )
})

// --- Helpers ---

function CleanupErrorsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const cleanup = useCleanupErrors()
  const [date, setDate] = useState(() =>
    toDateTimeLocal(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
  )
  const [deletedCount, setDeletedCount] = useState<number | null>(null)

  function onCleanup() {
    if (!date) {
      return
    }

    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) {
      return
    }

    cleanup.mutate(parsedDate.toISOString(), {
      onSuccess: (data) => {
        setDeletedCount(data.deleted_count)
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setDeletedCount(null)
          setDate(toDateTimeLocal(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
        }
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('platform.errors.cleanupErrors')}</DialogTitle>
          <DialogDescription>{t('platform.errors.cleanupBefore')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="datetime-local"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
            }}
          />
          {deletedCount !== null && (
            <p className="text-sm font-medium">
              {t('platform.errors.deletedCount').replace('{count}', String(deletedCount))}
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
