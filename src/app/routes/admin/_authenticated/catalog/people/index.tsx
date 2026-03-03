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
  peopleQueryOptions,
  PeopleTable,
  PersonForm,
  useCreatePerson,
  useDeletePerson,
  useUpdatePerson,
  type Person,
  type PersonFormValues,
} from '@/features/catalog'
import { useDebounce } from '@/hooks/use-debounce'
import { useTranslation } from '@/lib/i18n'
import { ApiException } from '@/types/api.types'

const peopleSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(DEFAULT_PAGE_SIZE),
  search: z.string().optional(),
  sort: z.string().optional(),
})

export const Route = createFileRoute('/admin/_authenticated/catalog/people/')({
  validateSearch: (search: Record<string, unknown>): PeopleSearch =>
    peopleSearchSchema.parse(search),
  component: PeoplePage,
})

interface PeopleSearch {
  page?: number | undefined
  pageSize?: number | undefined
  search?: string | undefined
  sort?: string | undefined
}

function PeoplePage() {
  const { t } = useTranslation()
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, search, sort } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [searchInput, setSearchInput] = useState(search ?? '')
  const debouncedSearch = useDebounce(searchInput, 500)

  // Sync debounced search to URL
  if (debouncedSearch !== (search ?? '')) {
    void navigate({
      search: (prev: PeopleSearch) => ({
        ...prev,
        search: debouncedSearch === '' ? undefined : debouncedSearch,
        page: 1,
      }),
    })
  }

  const { data: peopleResponse, isFetching } = useQuery({
    ...peopleQueryOptions({
      page_number: page,
      page_size: pageSize,
      search: search ?? undefined,
      sort: sort ?? undefined,
    }),
    placeholderData: keepPreviousData,
  })

  const createPerson = useCreatePerson()
  const updatePerson = useUpdatePerson()
  const deletePerson = useDeletePerson()

  async function handleCreate(values: PersonFormValues) {
    try {
      await createPerson.mutateAsync(values)
      toast.success(t('catalog.people.created'))
      setIsCreateDialogOpen(false)
    } catch (error: unknown) {
      const message = error instanceof ApiException ? error.message : 'Failed to create person'
      toast.error(message)
    }
  }

  async function handleUpdate(values: PersonFormValues) {
    if (editingPerson === null) {
      return
    }
    try {
      await updatePerson.mutateAsync({ id: editingPerson.id, ...values })
      toast.success(t('catalog.people.updated'))
      setEditingPerson(null)
    } catch (error: unknown) {
      const message = error instanceof ApiException ? error.message : 'Failed to update person'
      toast.error(message)
    }
  }

  async function handleDelete(id: string) {
    // eslint-disable-next-line no-alert
    if (!confirm(t('catalog.people.deleteConfirm'))) {
      return
    }
    try {
      await deletePerson.mutateAsync(id)
      toast.success(t('catalog.people.deleted'))
    } catch (error: unknown) {
      const message = error instanceof ApiException ? error.message : 'Failed to delete person'
      toast.error(message)
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    void navigate({
      search: (prev: PeopleSearch) => ({
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
        <h1 className="text-2xl font-semibold tracking-tight">{t('catalog.people.title')}</h1>
        <Button
          onClick={() => {
            setIsCreateDialogOpen(true)
          }}
        >
          <Plus className="mr-2 size-4" />
          {t('catalog.people.createPerson')}
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
          value={sort ?? 'full_name:asc'}
          onValueChange={(val) => {
            void navigate({
              search: (prev: PeopleSearch) => ({ ...prev, sort: val, page: 1 }),
            })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full_name:asc">Name (A-Z)</SelectItem>
            <SelectItem value="full_name:desc">Name (Z-A)</SelectItem>
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
        <PeopleTable
          people={peopleResponse?.content ?? []}
          onEdit={(person) => {
            setEditingPerson(person)
          }}
          onDelete={(id) => {
            void handleDelete(id)
          }}
        />
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalCount={peopleResponse?.count}
        onPageChange={(newPage) => {
          void navigate({
            search: (prev: PeopleSearch) => ({ ...prev, page: newPage }),
          })
        }}
        onPageSizeChange={(newSize) => {
          void navigate({
            search: (prev: PeopleSearch) => ({ ...prev, pageSize: newSize, page: 1 }),
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
            <DialogTitle>{t('catalog.people.createPerson')}</DialogTitle>
          </DialogHeader>
          <PersonForm onSubmit={handleCreate} isSubmitting={createPerson.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingPerson !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPerson(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('catalog.people.editPerson')}</DialogTitle>
          </DialogHeader>
          {editingPerson !== null && (
            <PersonForm
              defaultValues={{
                full_name: editingPerson.full_name,
                bio: editingPerson.bio ?? '',
                photo_url: editingPerson.photo_url ?? '',
              }}
              onSubmit={handleUpdate}
              isSubmitting={updatePerson.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
