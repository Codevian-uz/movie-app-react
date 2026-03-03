import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { TablePagination } from '@/components/TablePagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEFAULT_PAGE_SIZE } from '@/config/constants'
import {
  genresQueryOptions,
  moviesQueryOptions,
  peopleQueryOptions,
  useDeleteMovie,
} from '@/features/catalog'
import { MoviesTable } from '@/features/catalog/components/Movies/MoviesTable'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { ApiException } from '@/types/api.types'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../../-route-guards'

export const Route = createFileRoute('/admin/_authenticated/catalog/movies/')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.CATALOG_MOVIE_READ)
  },
  validateSearch: (search: Record<string, unknown>): MovieSearch => ({
    page: typeof search.page === 'number' && search.page >= 1 ? Math.floor(search.page) : undefined,
    pageSize:
      typeof search.pageSize === 'number' && search.pageSize >= 1
        ? Math.floor(search.pageSize)
        : undefined,
    search: typeof search.search === 'string' ? search.search : undefined,
    genre_id: typeof search.genre_id === 'string' ? search.genre_id : undefined,
    person_id: typeof search.person_id === 'string' ? search.person_id : undefined,
    role: typeof search.role === 'string' ? search.role : undefined,
    sort_by: typeof search.sort_by === 'string' ? search.sort_by : undefined,
    sort_order: typeof search.sort_order === 'string' ? search.sort_order : undefined,
  }),
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: MoviesPage,
})

interface MovieSearch {
  page?: number | undefined
  pageSize?: number | undefined
  search?: string | undefined
  genre_id?: string | undefined
  person_id?: string | undefined
  role?: string | undefined
  sort_by?: string | undefined
  sort_order?: string | undefined
}

function MoviesPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const { page, pageSize, search, genre_id, person_id, role, sort_by, sort_order } =
    Route.useSearch()
  const routeNavigate = Route.useNavigate()

  const [searchInput, setSearchInput] = useState(search ?? '')
  const debouncedSearch = useDebounce(searchInput, 500)

  const currentPage = page ?? 1
  const currentPageSize = pageSize ?? DEFAULT_PAGE_SIZE

  // Sync debounced search to URL
  if (debouncedSearch !== (search ?? '')) {
    void routeNavigate({
      search: (prev) => ({
        ...prev,
        search: debouncedSearch === '' ? undefined : debouncedSearch,
        page: undefined,
      }),
    })
  }

  const { data: moviesResponse, isFetching } = useQuery({
    ...moviesQueryOptions({
      limit: currentPageSize,
      offset: (currentPage - 1) * currentPageSize,
      search: search,
      genre_id: genre_id,
      person_id: person_id,
      role: role,
      sort_by: sort_by,
      sort_order: sort_order,
    }),
    placeholderData: keepPreviousData,
  })

  const { data: genresResponse } = useQuery(genresQueryOptions({ page_size: 100 }))
  const { data: peopleResponse } = useQuery(peopleQueryOptions({ page_size: 100 }))

  const deleteMovie = useDeleteMovie()
  const canManage = hasPermission(PERMISSIONS.CATALOG_MOVIE_MANAGE)

  async function handleDelete(id: string) {
    // eslint-disable-next-line no-alert
    if (!confirm(t('common.confirm.destructive'))) {
      return
    }
    try {
      await deleteMovie.mutateAsync(id)
      toast.success(t('catalog.movies.deleted'))
    } catch (error: unknown) {
      const message = error instanceof ApiException ? error.message : 'Failed to delete movie'
      toast.error(message)
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    void routeNavigate({
      search: (prev) => ({
        ...prev,
        search: undefined,
        genre_id: undefined,
        person_id: undefined,
        role: undefined,
        sort_by: undefined,
        sort_order: undefined,
        page: undefined,
      }),
    })
  }

  const hasActiveFilters =
    search !== undefined ||
    genre_id !== undefined ||
    person_id !== undefined ||
    role !== undefined ||
    sort_by !== undefined

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2 size-4" />
          <Input
            placeholder={t('common.actions.search')}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
            }}
            className="pl-8"
          />
        </div>

        <Select
          value={genre_id ?? 'all'}
          onValueChange={(val) => {
            void routeNavigate({
              search: (prev) => ({
                ...prev,
                genre_id: val === 'all' ? undefined : val,
                page: undefined,
              }),
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('catalog.movies.genres')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.labels.all')} Genres</SelectItem>
            {genresResponse?.content.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={person_id ?? 'all'}
          onValueChange={(val) => {
            void routeNavigate({
              search: (prev) => ({
                ...prev,
                person_id: val === 'all' ? undefined : val,
                page: undefined,
              }),
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Person" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.labels.all')} People</SelectItem>
            {peopleResponse?.content.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={role ?? 'all'}
          onValueChange={(val) => {
            void routeNavigate({
              search: (prev) => ({ ...prev, role: val === 'all' ? undefined : val, page: undefined }),
            })
          }}
          disabled={person_id === undefined}
        >
          <SelectTrigger>
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Role</SelectItem>
            <SelectItem value="Actor">Actor</SelectItem>
            <SelectItem value="Director">Director</SelectItem>
            <SelectItem value="Producer">Producer</SelectItem>
            <SelectItem value="Writer">Writer</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort_by ?? 'created_at'}
          onValueChange={(val) => {
            void routeNavigate({
              search: (prev) => ({ ...prev, sort_by: val, page: undefined }),
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="release_date">Release Date</SelectItem>
            <SelectItem value="rating_average">Rating</SelectItem>
            <SelectItem value="created_at">Created At</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Select
            value={sort_order ?? 'desc'}
            onValueChange={(val) => {
              void routeNavigate({
                search: (prev) => ({ ...prev, sort_order: val, page: undefined }),
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">ASC</SelectItem>
              <SelectItem value="desc">DESC</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className={isFetching ? 'opacity-50' : ''}>
        <MoviesTable
          movies={moviesResponse?.items ?? []}
          onDelete={(id) => {
            void handleDelete(id)
          }}
        />
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
