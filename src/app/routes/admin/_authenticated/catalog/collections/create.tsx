import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CollectionForm, useCreateCollection, type CollectionFormValues } from '@/features/catalog'
import { useTranslation } from '@/lib/i18n'

export const Route = createFileRoute('/admin/_authenticated/catalog/collections/create')({
  component: CreateCollectionPage,
})

function CreateCollectionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMutation = useCreateCollection()

  const onSubmit = async (values: CollectionFormValues) => {
    await createMutation.mutateAsync(values).then(() => {
      toast.success(t('catalog.collections.created'))
      void navigate({
        to: '/admin/catalog/collections',
        search: { page: undefined, pageSize: undefined, search: undefined, sort: undefined },
      })
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t('catalog.collections.createCollection')}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('catalog.collections.collectionTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CollectionForm onSubmit={onSubmit} isSubmitting={createMutation.isPending} />
        </CardContent>
      </Card>
    </div>
  )
}
