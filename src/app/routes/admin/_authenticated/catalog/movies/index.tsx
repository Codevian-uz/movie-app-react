import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { TablePagination } from '@/components/TablePagination'
import { Button } from '@/components/ui/button'
import { DEFAULT_PAGE_SIZE } from '@/config/constants'
import { moviesQueryOptions } from '@/features/catalog'
import { MoviesTable } from '@/features/catalog/components/Movies/MoviesTable'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../../-route-guards'

export const Route = createFileRoute('/admin/_authenticated/catalog/movies/')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.CATALOG_MOVIE_READ)
  },
  validateSearch: (search: Record<string, unknown>) => ({
    page: typeof search.page === 'number' && search.page >= 1 ? Math.floor(search.page) : undefined,
    pageSize:
      typeof search.pageSize === 'number' && search.pageSize >= 1
        ? Math.floor(search.pageSize)
        : undefined,
  }),
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: MoviesPage,
})

function MoviesPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const { page, pageSize } = Route.useSearch()
  const routeNavigate = Route.useNavigate()

  const currentPage = page ?? 1
  const currentPageSize = pageSize ?? DEFAULT_PAGE_SIZE

  const { data: moviesResponse, isFetching } = useQuery({
    ...moviesQueryOptions({
      limit: currentPageSize,
      offset: (currentPage - 1) * currentPageSize,
    }),
    placeholderData: keepPreviousData,
  })

  const canManage = hasPermission(PERMISSIONS.CATALOG_MOVIE_MANAGE)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {t('catalog.movies.title')}
        </h1>
        {canManage && (
          <Button size="sm" asChild>
            <Link
              to="/admin/catalog/movies/create"
              search={{ page: undefined, pageSize: undefined }}
            >
              <Plus className="mr-2 size-4" />
              {t('catalog.movies.createMovie')}
            </Link>
          </Button>
        )}
      </div>

      <div className={isFetching ? 'opacity-50' : ''}>
        <MoviesTable movies={moviesResponse?.items ?? []} />
      </div>

      <TablePagination
        page={currentPage}
        pageSize={currentPageSize}
        totalCount={moviesResponse?.total}
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
    </div>
  )
}
