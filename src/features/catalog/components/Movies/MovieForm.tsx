import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X } from 'lucide-react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getFileUrl, getStreamUrl, uploadFile } from '@/features/filevault'
import { useTranslation } from '@/lib/i18n'

const movieFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  poster_url: z.string().optional(),
  backdrop_url: z.string().optional(),
  trailer_url: z.string().optional(),
  release_date: z.string().optional(),
  duration_minutes: z.coerce.number().min(0).optional(),
  genre_ids: z.array(z.string()).default([]),
})

export type MovieFormValues = z.infer<typeof movieFormSchema>

interface MovieFormProps {
  defaultValues?: Partial<MovieFormValues>
  onSubmit: (values: MovieFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function MovieForm({ defaultValues, onSubmit, isSubmitting }: MovieFormProps) {
  const { t } = useTranslation()
  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      title: '',
      description: '',
      poster_url: '',
      backdrop_url: '',
      trailer_url: '',
      release_date: '',
      duration_minutes: 0,
      genre_ids: [],
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
              <FormLabel>{t('catalog.movies.movieTitle')}</FormLabel>
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
              <FormLabel>{t('catalog.movies.description')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="release_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('catalog.movies.releaseDate')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('catalog.movies.duration')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="genre_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('catalog.movies.genres')}</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter genre UUIDs (comma separated)"
                  value={field.value.join(', ')}
                  onChange={(e) => {
                    const val = e.target.value
                    field.onChange(val.split(',').map((s) => s.trim()).filter(Boolean))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-3">
          <FileUploadField name="poster_url" label={t('catalog.movies.poster')} form={form} />
          <FileUploadField name="backdrop_url" label={t('catalog.movies.backdrop')} form={form} />
          <FileUploadField name="trailer_url" label={t('catalog.movies.trailer')} form={form} />
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

function FileUploadField({
  name,
  label,
  form,
}: {
  name: 'poster_url' | 'backdrop_url' | 'trailer_url'
  label: string
  form: UseFormReturn<MovieFormValues>
}) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const value = form.watch(name)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    setIsUploading(true)
    try {
      const res = await uploadFile(file)
      const url = name === 'trailer_url' ? getStreamUrl(res.id) : getFileUrl(res.id)
      form.setValue(name, url)
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {value !== undefined && value !== '' ? (
          <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-md border">
            {name === 'trailer_url' ? (
              <div className="flex h-full items-center justify-center text-xs text-center px-2">
                Trailer attached (streaming enabled)
              </div>
            ) : (
              <img src={value} alt={label} className="h-full w-full object-cover" />
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 size-6"
              onClick={() => {
                form.setValue(name, '')
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-24 w-full border-dashed"
            disabled={isUploading}
            onClick={() => {
              inputRef.current?.click()
            }}
          >
            {isUploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="size-6" />
                <span className="text-xs">Upload</span>
              </div>
            )}
          </Button>
        )}
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          onChange={(e) => {
            void handleFileChange(e)
          }}
          accept={name === 'trailer_url' ? 'video/*' : 'image/*'}
        />
      </div>
    </div>
  )
}
