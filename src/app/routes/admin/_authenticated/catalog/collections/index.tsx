import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  collectionsQueryOptions,
  CollectionsTable,
  useDeleteCollection,
} from '@/features/catalog'
import { useTranslation } from '@/lib/i18n'

export const Route = createFileRoute('/admin/_authenticated/catalog/collections/')({
  component: CollectionsIndexPage,
})

function CollectionsIndexPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useSuspenseQuery(collectionsQueryOptions())
  const deleteMutation = useDeleteCollection()

  const handleDelete = (id: string) => {
    if (confirm(t('catalog.collections.deleteConfirm'))) {
      void deleteMutation.mutateAsync(id).then(() => {
        toast.success(t('catalog.collections.deleted'))
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('catalog.collections.title')}</h1>
          <p className="text-muted-foreground">{t('common.labels.totalCount', { count: data.total })}</p>
        </div>
        <Button asChild>
          <Link to="/admin/catalog/collections/create">
            <Plus className="mr-2 size-4" />
            {t('catalog.collections.createCollection')}
          </Link>
        </Button>
      </div>

      <CollectionsTable
        collections={data.items}
        onEdit={(collection) => {
          void navigate({
            to: '/admin/catalog/collections/$collectionId',
            params: { collectionId: collection.id },
          })
        }}
        onDelete={handleDelete}
      />
    </div>
  )
}
