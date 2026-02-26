import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { TablePagination } from '@/components/TablePagination'
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
import {
  type Session,
  userSessionsQueryOptions,
  useDeleteSession,
  useDeleteUserSessions,
} from '@/features/auth'
import { useTranslation } from '@/lib/i18n'
import { formatRelativeTime, parseUserAgent } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from './-route-guards'

interface SessionsSearch {
  userId?: string | undefined
  page?: number | undefined
  pageSize?: number | undefined
}

export const Route = createFileRoute('/admin/_authenticated/sessions')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.SESSION_READ)
  },
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: SessionsPage,
  validateSearch: (search: Record<string, unknown>): SessionsSearch => ({
    userId: typeof search.userId === 'string' ? search.userId : undefined,
    page: typeof search.page === 'number' && search.page >= 1 ? Math.floor(search.page) : undefined,
    pageSize:
      typeof search.pageSize === 'number' && search.pageSize >= 1
        ? Math.floor(search.pageSize)
        : undefined,
  }),
})

function SessionsPage() {
  const { t } = useTranslation()
  const { userId } = Route.useSearch()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
        {t('auth.sessions.allSessions')}
      </h1>

      <AllSessionsContent initialUserId={userId} />
    </div>
  )
}

// --- All Sessions Content ---

function AllSessionsContent({ initialUserId }: { initialUserId?: string | undefined }) {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const canManage = hasPermission(PERMISSIONS.SESSION_MANAGE)
  const { page, pageSize } = Route.useSearch()
  const routeNavigate = Route.useNavigate()
  const currentPage = page ?? 1
  const currentPageSize = pageSize ?? DEFAULT_PAGE_SIZE
  const [userId, setUserId] = useState(initialUserId ?? '')
  const [searchUserId, setSearchUserId] = useState(initialUserId ?? '')

  const { data, refetch } = useQuery({
    ...userSessionsQueryOptions({
      user_id: searchUserId,
      page_number: currentPage,
      page_size: currentPageSize,
    }),
    enabled: searchUserId.length > 0,
  })

  const sessions = data?.content ?? []
  const totalCount = data?.count

  const deleteSession = useDeleteSession()
  const deleteAllSessions = useDeleteUserSessions()
  const [revokeId, setRevokeId] = useState<number | null>(null)
  const [revokeAll, setRevokeAll] = useState(false)

  function onRevokeSingle() {
    if (revokeId === null) {
      return
    }
    deleteSession.mutate(revokeId, {
      onSuccess: () => {
        toast.success(t('auth.sessions.revoked'))
        setRevokeId(null)
      },
    })
  }

  function onRevokeAll() {
    if (!searchUserId) {
      return
    }
    deleteAllSessions.mutate(searchUserId, {
      onSuccess: () => {
        toast.success(t('auth.sessions.allRevoked'))
        setRevokeAll(false)
      },
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder={t('auth.sessions.searchByUserId')}
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (userId === searchUserId) {
                void refetch()
              } else {
                setSearchUserId(userId)
                void routeNavigate({ search: (prev) => ({ ...prev, page: undefined }) })
              }
            }
          }}
          className="max-w-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (userId === searchUserId) {
              void refetch()
            } else {
              setSearchUserId(userId)
              void routeNavigate({ search: (prev) => ({ ...prev, page: undefined }) })
            }
          }}
        >
          {t('common.actions.search')}
        </Button>
        {canManage && sessions.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setRevokeAll(true)
            }}
          >
            {t('auth.sessions.revokeAll')}
          </Button>
        )}
      </div>

      {searchUserId && sessions.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('auth.sessions.noSessions')}
        </p>
      ) : (
        sessions.length > 0 && (
          <div className="mt-4">
            <SessionsTable
              sessions={sessions}
              onRevoke={
                canManage
                  ? (id: number) => {
                      setRevokeId(id)
                    }
                  : undefined
              }
            />
          </div>
        )
      )}

      {searchUserId.length > 0 && (
        <TablePagination
          page={currentPage}
          pageSize={currentPageSize}
          {...(totalCount !== undefined ? { totalCount } : {})}
          onPageChange={(newPage) => {
            void routeNavigate({
              search: (prev) => ({ ...prev, page: newPage === 1 ? undefined : newPage }),
            })
          }}
          onPageSizeChange={(newSize) => {
            void routeNavigate({
              search: (prev) => ({
                ...prev,
                pageSize: newSize === DEFAULT_PAGE_SIZE ? undefined : newSize,
                page: undefined,
              }),
            })
          }}
        />
      )}

      <AlertDialog
        open={revokeId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRevokeId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('auth.sessions.revokeConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onRevokeSingle} disabled={deleteSession.isPending}>
              {t('auth.sessions.revoke')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeAll} onOpenChange={setRevokeAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('auth.sessions.revokeAllConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onRevokeAll}
              disabled={deleteAllSessions.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('auth.sessions.revokeAll')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// --- Shared Sessions Table ---

function SessionsTable({
  sessions,
  onRevoke,
  isCurrent,
}: {
  sessions: Session[]
  onRevoke?: ((id: number) => void) | undefined
  isCurrent?: ((session: Session) => boolean) | undefined
}) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('auth.sessions.ipAddress')}</TableHead>
            <TableHead>{t('auth.sessions.browser')}</TableHead>
            <TableHead>{t('auth.sessions.lastUsed')}</TableHead>
            <TableHead>{t('common.labels.createdAt')}</TableHead>
            <TableHead>{t('auth.sessions.expires')}</TableHead>
            {onRevoke && <TableHead className="w-24" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const current = isCurrent?.(session) === true
            return (
              <TableRow key={session.id}>
                <TableCell className="font-mono text-sm">{session.ip_address}</TableCell>
                <TableCell>{parseUserAgent(session.user_agent)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeTime(session.last_used_at)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(session.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(session.refresh_token_expires_at).toLocaleDateString()}
                </TableCell>
                {onRevoke && (
                  <TableCell>
                    {current ? (
                      <Badge variant="outline">{t('common.labels.current')}</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onRevoke(session.id)
                        }}
                      >
                        {t('auth.sessions.revoke')}
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
