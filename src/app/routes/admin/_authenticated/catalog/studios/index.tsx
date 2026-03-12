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
  StudioForm,
  studiosQueryOptions,
  StudiosTable,
  useCreateStudio,
  useDeleteStudio,
  useUpdateStudio,
  type Studio,
  type StudioFormValues,
} from '@/features/catalog'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { ApiException } from '@/types/api.types'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../../-route-guards'

const studiosSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(DEFAULT_PAGE_SIZE),
  search: z.string().optional(),
  sort: z.string().optional(),
})

export const Route = createFileRoute('/admin/_authenticated/catalog/studios/')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.CATALOG_STUDIO_READ)
  },
  validateSearch: (search: Record<string, unknown>): StudioSearch =>
    studiosSearchSchema.parse(search),
  component: StudiosPage,
})

interface StudioSearch {
  page?: number | undefined
  pageSize?: number | undefined
  search?: string | undefined
  sort?: string | undefined
}

function StudiosPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, search, sort } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [searchInput, setSearchInput] = useState(search ?? '')
  const debouncedSearch = useDebounce(searchInput, 500)

  // Sync debounced search to URL
  if (debouncedSearch !== (search ?? '')) {
    void navigate({
      search: (prev: StudioSearch) => ({
        ...prev,
        search: debouncedSearch === '' ? undefined : debouncedSearch,
        page: 1,
      }),
    })
  }

  const { data: studiosResponse, isFetching } = useQuery({
    ...studiosQueryOptions({
      page_number: page,
      page_size: pageSize,
      search: search ?? undefined,
      sort: sort ?? undefined,
    }),
    placeholderData: keepPreviousData,
  })

  const createStudio = useCreateStudio()
  const updateStudio = useUpdateStudio()
  const deleteStudio = useDeleteStudio()
  const canManage = hasPermission(PERMISSIONS.CATALOG_STUDIO_MANAGE)

  async function handleCreate(values: StudioFormValues) {
    if (!canManage) {
      return
    }
    try {
      await createStudio.mutateAsync(values)
      toast.success(t('catalog.studios.created'))
      setIsCreateDialogOpen(false)
    } catch (error: unknown) {
      const message = error instanceof ApiException ? error.message : 'Failed to create studio'
      toast.error(message)
    }
  }

  async function handleUpdate(values: StudioFormValues) {
    if (!canManage || editingStudio === null) {
      return
    }
    try {
      await updateStudio.mutateAsync({ id: editingStudio.id, ...values })
      toast.success(t('catalog.studios.updated'))
      setEditingStudio(null)
    } catch (error: unknown) {
      const message = error instanceof ApiException ? error.message : 'Failed to update studio'
      toast.error(message)
    }
  }

  async function handleDelete(id: string) {
    if (!canManage) {
      return
    }
    // eslint-disable-next-line no-alert
    if (!confirm(t('catalog.studios.deleteConfirm'))) {
      return
    }
    try {
      await deleteStudio.mutateAsync(id)
      toast.success(t('catalog.studios.deleted'))
    } catch (error: unknown) {
      const message = error instanceof ApiException ? error.message : 'Failed to delete studio'
      toast.error(message)
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    void navigate({
      search: (prev: StudioSearch) => ({
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
        <h1 className="text-2xl font-semibold tracking-tight">{t('catalog.studios.title')}</h1>
        {canManage && (
          <Button
            onClick={() => {
              setIsCreateDialogOpen(true)
            }}
          >
            <Plus className="mr-2 size-4" />
            {t('catalog.studios.createStudio')}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-200px relative max-w-sm flex-1">
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
              search: (prev: StudioSearch) => ({ ...prev, sort: val, page: 1 }),
            })
          }}
        >
          <SelectTrigger className="w-180px">
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
        <StudiosTable
          studios={studiosResponse?.content ?? []}
          onEdit={(studio) => {
            setEditingStudio(studio)
          }}
          onDelete={(id) => {
            void handleDelete(id)
          }}
        />
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalCount={studiosResponse?.count}
        onPageChange={(newPage) => {
          void navigate({
            search: (prev: StudioSearch) => ({ ...prev, page: newPage }),
          })
        }}
        onPageSizeChange={(newSize) => {
          void navigate({
            search: (prev: StudioSearch) => ({ ...prev, pageSize: newSize, page: 1 }),
          })
        }}
      />

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('catalog.studios.createStudio')}</DialogTitle>
          </DialogHeader>
          <StudioForm
            onSubmit={(values) => {
              void handleCreate(values)
            }}
            isSubmitting={createStudio.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingStudio !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingStudio(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('catalog.studios.editStudio')}</DialogTitle>
          </DialogHeader>
          {editingStudio !== null && (
            <StudioForm
              defaultValues={{
                name: editingStudio.name,
                description: editingStudio.description ?? '',
                logo_url: editingStudio.logo_url ?? '',
              }}
              onSubmit={(values) => {
                void handleUpdate(values)
              }}
              isSubmitting={updateStudio.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
