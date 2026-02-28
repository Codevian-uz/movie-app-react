import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  GenreForm,
  genresQueryOptions,
  GenresTable,
  useCreateGenre,
  useDeleteGenre,
  useUpdateGenre,
  type Genre,
} from '@/features/catalog'
import { useTranslation } from '@/lib/i18n'
import { ApiException } from '@/types/api.types'

const genresSearchSchema = z.object({
  page: z.number().catch(1),
  search: z.string().optional(),
})

export const Route = createFileRoute('/admin/_authenticated/catalog/genres/')({
  validateSearch: (search) => genresSearchSchema.parse(search),
  component: GenresPage,
})

function GenresPage() {
  const { t } = useTranslation()
  const { page, search } = Route.useSearch()
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: genresResponse } = useQuery(
    genresQueryOptions({
      page_number: page,
      page_size: 20,
      search: search ?? undefined,
    }),
  )

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('catalog.genres.title')}</h1>
          <p className="text-muted-foreground">{t('catalog.genres.noGenres')}</p>
        </div>
        <Button
          onClick={() => {
            setIsCreateDialogOpen(true)
          }}
        >
          <Plus className="mr-2 size-4" />
          {t('catalog.genres.createGenre')}
        </Button>
      </div>

      <GenresTable
        genres={genresResponse?.content ?? []}
        onEdit={(genre) => {
          setEditingGenre(genre)
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
