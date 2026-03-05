import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
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
import { collectionsQueryOptions, CollectionsTable, useDeleteCollection } from '@/features/catalog'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslation } from '@/lib/i18n'

const collectionsSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(DEFAULT_PAGE_SIZE),
  search: z.string().optional(),
  sort: z.string().optional(),
})

export const Route = createFileRoute('/admin/_authenticated/catalog/collections/')({
  validateSearch: (search: Record<string, unknown>): CollectionSearch =>
    collectionsSearchSchema.parse(search),
  component: CollectionsIndexPage,
})

interface CollectionSearch {
  page?: number | undefined
  pageSize?: number | undefined
  search?: string | undefined
  sort?: string | undefined
}

function CollectionsIndexPage() {
  const { t } = useTranslation()
  const navigate = useNavigate({ from: Route.fullPath })
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, search, sort } = Route.useSearch()

  const [searchInput, setSearchInput] = useState(search ?? '')
  const debouncedSearch = useDebounce(searchInput, 500)

  // Sync debounced search to URL
  if (debouncedSearch !== (search ?? '')) {
    void navigate({
      search: (prev: CollectionSearch) => ({
        ...prev,
        search: debouncedSearch === '' ? undefined : debouncedSearch,
        page: 1,
      }),
    })
  }

  const { data, isFetching } = useQuery({
    ...collectionsQueryOptions({
      page_size: pageSize,
      page_number: page,
      search: search ?? undefined,
      sort: sort ?? undefined,
    }),
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useDeleteCollection()

  const handleDelete = (id: string) => {
    // eslint-disable-next-line no-alert
    if (confirm(t('catalog.collections.deleteConfirm'))) {
      void deleteMutation.mutateAsync(id).then(() => {
        toast.success(t('catalog.collections.deleted'))
      })
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    void navigate({
      search: (prev: CollectionSearch) => ({
        ...prev,
        search: undefined,
        sort: undefined,
        page: 1,
      }),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t('catalog.collections.title')}</h1>
        <Button asChild>
          <Link
            to="/admin/catalog/collections/create"
            search={{ page: 1, pageSize: DEFAULT_PAGE_SIZE }}
          >
            <Plus className="mr-2 size-4" />
            {t('catalog.collections.createCollection')}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative max-w-sm min-w-[200px] flex-1">
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
          value={sort ?? 'created_at:desc'}
          onValueChange={(val) => {
            void navigate({
              search: (prev: CollectionSearch) => ({ ...prev, sort: val, page: 1 }),
            })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title:asc">Title (A-Z)</SelectItem>
            <SelectItem value="title:desc">Title (Z-A)</SelectItem>
            <SelectItem value="created_at:desc">Newest First</SelectItem>
            <SelectItem value="created_at:asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        {(search !== undefined || sort !== undefined) && (
          <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className={isFetching ? 'opacity-50' : ''}>
        <CollectionsTable
          collections={data?.content ?? []}
          onEdit={(collection) => {
            void navigate({
              to: '/admin/catalog/collections/$collectionId',
              params: { collectionId: collection.id },
            })
          }}
          onDelete={handleDelete}
        />
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalCount={data?.count}
        onPageChange={(newPage) => {
          void navigate({
            search: (prev: CollectionSearch) => ({ ...prev, page: newPage }),
          })
        }}
        onPageSizeChange={(newSize) => {
          void navigate({
            search: (prev: CollectionSearch) => ({ ...prev, pageSize: newSize, page: 1 }),
          })
        }}
      />
    </div>
  )
}
