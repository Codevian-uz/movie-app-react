import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileUploadField } from '@/features/filevault'
import { useTranslation } from '@/lib/i18n'

const collectionFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  poster_url: z.string().optional(),
  backdrop_url: z.string().optional(),
})

export type CollectionFormValues = z.infer<typeof collectionFormSchema>

interface CollectionFormProps {
  defaultValues?: Partial<CollectionFormValues>
  onSubmit: (values: CollectionFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function CollectionForm({ defaultValues, onSubmit, isSubmitting }: CollectionFormProps) {
  const { t } = useTranslation()
  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      title: '',
      description: '',
      poster_url: '',
      backdrop_url: '',
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          void form.handleSubmit(onSubmit)(e)
        }}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('catalog.collections.collectionTitle')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('catalog.collections.description')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FileUploadField
            name="poster_url"
            label={t('catalog.collections.poster')}
            form={form}
            aspect="poster"
          />
          <FileUploadField
            name="backdrop_url"
            label={t('catalog.collections.backdrop')}
            form={form}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting === true}>
            {isSubmitting === true && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t('common.actions.save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
