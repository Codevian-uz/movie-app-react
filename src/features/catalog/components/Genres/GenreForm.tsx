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
import { useTranslation } from '@/lib/i18n'

const genreFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
})

export type GenreFormValues = z.infer<typeof genreFormSchema>

interface GenreFormProps {
  defaultValues?: Partial<GenreFormValues>
  onSubmit: (values: GenreFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function GenreForm({ defaultValues, onSubmit, isSubmitting }: GenreFormProps) {
  const { t } = useTranslation()
  const form = useForm<GenreFormValues>({
    resolver: zodResolver(genreFormSchema),
    defaultValues: {
      name: '',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('catalog.genres.genreName')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
