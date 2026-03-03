import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  collectionQueryOptions,
  CollectionForm,
  useUpdateCollection,
  type CollectionFormValues,
} from '@/features/catalog'
import { useTranslation } from '@/lib/i18n'

export const Route = createFileRoute('/admin/_authenticated/catalog/collections/$collectionId')({
  component: EditCollectionPage,
})

function EditCollectionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { collectionId } = Route.useParams()
  const { data: collection } = useSuspenseQuery(collectionQueryOptions(collectionId))
  const updateMutation = useUpdateCollection()

  const onSubmit = async (values: CollectionFormValues) => {
    await updateMutation.mutateAsync({ id: collectionId, ...values }).then(() => {
      toast.success(t('catalog.collections.updated'))
      void navigate({
        to: '/admin/catalog/collections',
        search: { page: undefined, pageSize: undefined, search: undefined, sort: undefined },
      })
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t('catalog.collections.editCollection')}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('catalog.collections.collectionTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CollectionForm
            defaultValues={{
              title: collection.title,
              description: collection.description ?? '',
              poster_url: collection.poster_url ?? '',
              backdrop_url: collection.backdrop_url ?? '',
            }}
            onSubmit={onSubmit}
            isSubmitting={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
