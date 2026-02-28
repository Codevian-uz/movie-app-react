import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { getFileUrl, uploadFile, useAuthenticatedFile } from '@/features/filevault'
import { useTranslation } from '@/lib/i18n'

const personFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255),
  bio: z.string().optional(),
  photo_url: z.string().optional(),
})

export type PersonFormValues = z.infer<typeof personFormSchema>

interface PersonFormProps {
  defaultValues?: Partial<PersonFormValues>
  onSubmit: (values: PersonFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function PersonForm({ defaultValues, onSubmit, isSubmitting }: PersonFormProps) {
  const { t } = useTranslation()
  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: {
      full_name: '',
      bio: '',
      photo_url: '',
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
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('catalog.people.fullName')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('catalog.people.bio')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photo_url"
          render={({ field }) => (
            <PhotoUploadField
              label={t('catalog.people.photo')}
              value={field.value}
              onChange={field.onChange}
            />
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

function PhotoUploadField({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string | undefined
  onChange: (val: string) => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const shouldFetch =
    value !== '' && value !== undefined && localPreview === null && !value.startsWith('blob:')
  const { objectUrl, isLoading: isFetching } = useAuthenticatedFile(shouldFetch ? value : null)

  const displayUrl = localPreview ?? objectUrl

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const localUrl = URL.createObjectURL(file)
    setLocalPreview(localUrl)

    setIsUploading(true)
    try {
      const res = await uploadFile(file)
      const url = getFileUrl(res.id)
      onChange(url)
      toast.success('Photo uploaded')
    } catch {
      toast.error('Upload failed')
      setLocalPreview(null)
      URL.revokeObjectURL(localUrl)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {value !== undefined && value !== '' ? (
          <div className="bg-muted relative aspect-square w-32 overflow-hidden rounded-md border">
            {isFetching ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-4 animate-spin" />
              </div>
            ) : (
              <img src={displayUrl ?? ''} alt={label} className="h-full w-full object-cover" />
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 size-6"
              onClick={() => {
                onChange('')
                if (localPreview !== null) {
                  URL.revokeObjectURL(localPreview)
                  setLocalPreview(null)
                }
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-32 w-32 border-dashed"
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
          accept="image/*"
        />
      </div>
    </div>
  )
}
