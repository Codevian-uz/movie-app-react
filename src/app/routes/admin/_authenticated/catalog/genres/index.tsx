import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { TablePagination } from '@/components/TablePagination'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  GenreForm,
  genresQueryOptions,
  GenresTable,
  useCreateGenre,
  useDeleteGenre,
  useUpdateGenre,
  type Genre,
} from '@/features/catalog'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslation } from '@/lib/i18n'
import { ApiException } from '@/types/api.types'

const genresSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(DEFAULT_PAGE_SIZE),
  search: z.string().optional(),
  sort: z.string().optional(),
})

export const Route = createFileRoute('/admin/_authenticated/catalog/genres/')({
  validateSearch: (search: Record<string, unknown>): GenreSearch =>
    genresSearchSchema.parse(search),
  component: GenresPage,
})

interface GenreSearch {
  page?: number | undefined
  pageSize?: number | undefined
  search?: string | undefined
  sort?: string | undefined
}

function GenresPage() {
  const { t } = useTranslation()
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, search, sort } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [searchInput, setSearchInput] = useState(search ?? '')
  const debouncedSearch = useDebounce(searchInput, 500)

  // Sync debounced search to URL
  if (debouncedSearch !== (search ?? '')) {
    void navigate({
      search: (prev: GenreSearch) => ({
        ...prev,
        search: debouncedSearch === '' ? undefined : debouncedSearch,
        page: 1,
      }),
    })
  }

  const { data: genresResponse, isFetching } = useQuery({
    ...genresQueryOptions({
      page_number: page,
      page_size: pageSize,
      search: search ?? undefined,
      sort: sort ?? undefined,
    }),
    placeholderData: keepPreviousData,
  })

  const createGenre = useCreateGenre()
  const updateGenre = useUpdateGenre()
  const deleteGenre = useDeleteGenre()

  async function handleCreate(values: { name: string }) {
    try {
      await createGenre.mutateAsync(values)
      toast.success(t('catalog.genres.created'))
      setIsCreateDialogOpen(false)
    } catch (error: unknown) {
      const message = error instanceof ApiException ? error.message : 'Failed to create genre'
      toast.error(message)
    }
  }

  async function handleUpdate(values: { name: string }) {
    if (editingGenre === null) {
      return
    }
    try {
      await updateGenre.mutateAsync({ id: editingGenre.id, ...values })
      toast.success(t('catalog.genres.updated'))
      setEditingGenre(null)
    } catch (error: unknown) {
      const message = error instanceof ApiException ? error.message : 'Failed to update genre'
      toast.error(message)
    }
  }

  async function handleDelete(id: string) {
    // eslint-disable-next-line no-alert
    if (!confirm(t('catalog.genres.deleteConfirm'))) {
      return
    }
    try {
      await deleteGenre.mutateAsync(id)
      toast.success(t('catalog.genres.deleted'))
    } catch (error: unknown) {
      const message = error instanceof ApiException ? error.message : 'Failed to delete genre'
      toast.error(message)
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    void navigate({
      search: (prev: GenreSearch) => ({
        ...prev,
        search: undefined,
        sort: undefined,
        page: 1,
      }),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t('catalog.genres.title')}</h1>
        <Button
          onClick={() => {
            setIsCreateDialogOpen(true)
          }}
        >
          <Plus className="mr-2 size-4" />
          {t('catalog.genres.createGenre')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
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
          value={sort ?? 'name:asc'}
          onValueChange={(val) => {
            void navigate({
              search: (prev: GenreSearch) => ({ ...prev, sort: val, page: 1 }),
            })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name:asc">Name (A-Z)</SelectItem>
            <SelectItem value="name:desc">Name (Z-A)</SelectItem>
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
        <GenresTable
          genres={genresResponse?.content ?? []}
          onEdit={(genre) => {
            setEditingGenre(genre)
          }}
          onDelete={(id) => {
            void handleDelete(id)
          }}
        />
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalCount={genresResponse?.count}
        onPageChange={(newPage) => {
          void navigate({
            search: (prev: GenreSearch) => ({ ...prev, page: newPage }),
          })
        }}
        onPageSizeChange={(newSize) => {
          void navigate({
            search: (prev: GenreSearch) => ({ ...prev, pageSize: newSize, page: 1 }),
          })
        }}
      />

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('catalog.genres.createGenre')}</DialogTitle>
          </DialogHeader>
          <GenreForm onSubmit={handleCreate} isSubmitting={createGenre.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingGenre !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingGenre(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('catalog.genres.editGenre')}</DialogTitle>
          </DialogHeader>
          {editingGenre !== null && (
            <GenreForm
              defaultValues={{ name: editingGenre.name }}
              onSubmit={handleUpdate}
              isSubmitting={updateGenre.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
