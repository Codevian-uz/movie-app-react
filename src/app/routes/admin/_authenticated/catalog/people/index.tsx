import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { useTranslation } from '@/lib/i18n'
import { ApiException } from '@/types/api.types'

const peopleSearchSchema = z.object({
  page: z.number().catch(1),
  search: z.string().optional(),
})

export const Route = createFileRoute('/admin/_authenticated/catalog/people/')({
  validateSearch: (search) => peopleSearchSchema.parse(search),
  component: PeoplePage,
})

function PeoplePage() {
  const { t } = useTranslation()
  const { page, search } = Route.useSearch()
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: peopleResponse } = useQuery(
    peopleQueryOptions({
      page_number: page,
      page_size: 20,
      search: search ?? undefined,
    }),
  )

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('catalog.people.title')}</h1>
          <p className="text-muted-foreground">{t('catalog.people.noPeople')}</p>
        </div>
        <Button
          onClick={() => {
            setIsCreateDialogOpen(true)
          }}
        >
          <Plus className="mr-2 size-4" />
          {t('catalog.people.createPerson')}
        </Button>
      </div>

      <PeopleTable
        people={peopleResponse?.content ?? []}
        onEdit={(person) => {
          setEditingPerson(person)
        }}
        onDelete={(id) => {
          void handleDelete(id)
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
