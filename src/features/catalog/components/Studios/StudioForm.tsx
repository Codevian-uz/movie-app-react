import { zodResolver } from '@hookform/resolvers/zod'
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

const studioFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  logo_url: z.string().optional().or(z.literal('')),
})

export type StudioFormValues = z.infer<typeof studioFormSchema>

interface StudioFormProps {
  defaultValues?: Partial<StudioFormValues>
  onSubmit: (values: StudioFormValues) => void
  isSubmitting?: boolean
}

export function StudioForm({ defaultValues, onSubmit, isSubmitting }: StudioFormProps) {
  const { t } = useTranslation()
  const form = useForm<StudioFormValues>({
    resolver: zodResolver(studioFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      logo_url: defaultValues?.logo_url ?? '',
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          void form.handleSubmit(onSubmit)(e)
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('catalog.studios.name')}</FormLabel>
              <FormControl>
                <Input placeholder="Studio name" {...field} />
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
              <FormLabel>{t('catalog.studios.description')}</FormLabel>
              <FormControl>
                <Textarea placeholder="Studio description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FileUploadField
          name="logo_url"
          label={t('catalog.studios.logoUrl')}
          form={form}
          aspect="square"
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting === true}>
            {isSubmitting === true ? t('common.actions.saving') : t('common.actions.save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
