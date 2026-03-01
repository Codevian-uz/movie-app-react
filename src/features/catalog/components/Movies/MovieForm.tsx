import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { useFieldArray, useForm, type UseFormReturn, type Path } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { getFileUrl, getStreamUrl, uploadFile, useAuthenticatedFile } from '@/features/filevault'
import { useTranslation } from '@/lib/i18n'
import { genresQueryOptions, peopleQueryOptions } from '../../api/catalog.queries'
import { EpisodeManager } from '../Episodes/EpisodeManager'

const movieFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  poster_url: z.string().optional(),
  backdrop_url: z.string().optional(),
  trailer_url: z.string().optional(),
  video_url: z.string().optional(),
  release_date: z.string().optional(),
  duration_minutes: z.coerce.number().min(0).optional(),
  genre_ids: z.array(z.string()).default([]),
  credits: z
    .array(
      z.object({
        person_id: z.string().min(1, 'Person is required'),
        role: z.string().min(1, 'Role is required'),
        character_name: z.string().optional(),
        display_order: z.coerce.number().default(0),
      }),
    )
    .default([]),
})

export type MovieFormValues = z.infer<typeof movieFormSchema>

interface MovieFormProps {
  movieId?: string | undefined
  defaultValues?: Partial<MovieFormValues>
  onSubmit: (values: MovieFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function MovieForm({ movieId, defaultValues, onSubmit, isSubmitting }: MovieFormProps) {
  const { t } = useTranslation()
  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      title: '',
      description: '',
      poster_url: '',
      backdrop_url: '',
      trailer_url: '',
      video_url: '',
      release_date: '',
      duration_minutes: 0,
      genre_ids: [],
      credits: [],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'credits',
  })

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="general">General Info</TabsTrigger>
        <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
        {movieId !== undefined && <TabsTrigger value="episodes">Seasons & Episodes</TabsTrigger>}
      </TabsList>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e)
          }}
          className="space-y-8"
        >
          <TabsContent value="general" className="space-y-8 outline-hidden">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
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
                        <Textarea {...field} rows={5} />
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
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('catalog.movies.genres')}</FormLabel>
                      <GenreSelect
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val)
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FileUploadField
                    name="poster_url"
                    label={t('catalog.movies.poster')}
                    form={form}
                  />
                  <FileUploadField
                    name="backdrop_url"
                    label={t('catalog.movies.backdrop')}
                    form={form}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FileUploadField
                    name="trailer_url"
                    label={t('catalog.movies.trailer')}
                    form={form}
                  />
                  <FileUploadField name="video_url" label={t('catalog.movies.video')} form={form} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cast" className="space-y-4 outline-hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t('catalog.movies.cast')}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  append({
                    person_id: '',
                    role: 'Actor',
                    character_name: '',
                    display_order: fields.length,
                  })
                }}
              >
                <Plus className="mr-2 size-4" />
                {t('catalog.credits.addCredit')}
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-muted/50 grid items-end gap-4 rounded-lg p-4 sm:grid-cols-4"
                >
                  <FormField
                    control={form.control}
                    name={`credits.${index.toString()}.person_id` as Path<MovieFormValues>}
                    render={({ field: pField }) => (
                      <FormItem>
                        <FormLabel>{t('catalog.credits.person')}</FormLabel>
                        <PersonSelect
                          value={typeof pField.value === 'string' ? pField.value : ''}
                          onChange={(val) => {
                            pField.onChange(val)
                          }}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`credits.${index.toString()}.role` as Path<MovieFormValues>}
                    render={({ field: rField }) => (
                      <FormItem>
                        <FormLabel>{t('catalog.credits.role')}</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(val) => {
                              rField.onChange(val)
                            }}
                            defaultValue={typeof rField.value === 'string' ? rField.value : ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Actor">Actor</SelectItem>
                              <SelectItem value="Director">Director</SelectItem>
                              <SelectItem value="Producer">Producer</SelectItem>
                              <SelectItem value="Writer">Writer</SelectItem>
                              <SelectItem value="Editor">Editor</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`credits.${index.toString()}.character_name` as Path<MovieFormValues>}
                    render={({ field: cField }) => (
                      <FormItem>
                        <FormLabel>{t('catalog.credits.characterName')}</FormLabel>
                        <FormControl>
                          <Input
                            {...cField}
                            value={typeof cField.value === 'string' ? cField.value : ''}
                            placeholder="Optional"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name={`credits.${index.toString()}.display_order` as Path<MovieFormValues>}
                      render={({ field: dField }) => (
                        <FormItem className="flex-1">
                          <FormLabel>{t('catalog.credits.displayOrder')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...dField}
                              value={typeof dField.value === 'number' ? dField.value : 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        remove(index)
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <div className="border-muted text-muted-foreground rounded-lg border-2 border-dashed p-8 text-center">
                  No credits added yet.
                </div>
              )}
            </div>
          </TabsContent>

          {movieId !== undefined && (
            <TabsContent value="episodes" className="outline-hidden">
              <EpisodeManager movieId={movieId} />
            </TabsContent>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="submit" disabled={isSubmitting === true} size="lg">
              {isSubmitting === true && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t('common.actions.save')}
            </Button>
          </div>
        </form>
      </Form>
    </Tabs>
  )
}

function GenreSelect({ value, onChange }: { value: string[]; onChange: (val: string[]) => void }) {
  const { data: genresResponse, isLoading } = useQuery(genresQueryOptions({ page_size: 100 }))
  const genres = genresResponse?.content ?? []

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          {value.length > 0 ? `${value.length.toString()} selected` : 'Select genres'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <ScrollArea className="h-60 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {genres.map((genre) => (
                <div key={genre.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${genre.id}`}
                    checked={value.includes(genre.id)}
                    onCheckedChange={(checked) => {
                      if (checked === true) {
                        onChange([...value, genre.id])
                      } else {
                        onChange(value.filter((id) => id !== genre.id))
                      }
                    }}
                  />
                  <label
                    htmlFor={`genre-${genre.id}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {genre.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function PersonSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [search, setSearch] = useState('')
  const { data: peopleResponse, isLoading } = useQuery(
    peopleQueryOptions({ search, page_size: 50 }),
  )
  const people = peopleResponse?.content ?? []

  return (
    <Select
      onValueChange={(val) => {
        onChange(val)
      }}
      defaultValue={value}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select person" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
            }}
            onKeyDown={(e) => {
              e.stopPropagation()
            }}
          />
        </div>
        <ScrollArea className="h-60">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : (
            <>
              {people.map((person) => (
                <SelectItem key={person.id} value={person.id}>
                  {person.full_name}
                </SelectItem>
              ))}
              {people.length === 0 && (
                <div className="text-muted-foreground p-4 text-center text-xs">No people found</div>
              )}
            </>
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  )
}

function FileUploadField({
  name,
  label,
  form,
}: {
  name: 'poster_url' | 'backdrop_url' | 'trailer_url' | 'video_url'
  label: string
  form: UseFormReturn<MovieFormValues>
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const value = form.watch(name)

  const shouldFetch =
    value !== '' && value !== undefined && localPreview === null && !value.startsWith('blob:')
  const { objectUrl, isLoading: isFetching } = useAuthenticatedFile(shouldFetch ? value : null)

  const displayUrl = localPreview ?? objectUrl

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file === undefined) {
      return
    }

    const localUrl = URL.createObjectURL(file)
    setLocalPreview(localUrl)

    setIsUploading(true)
    try {
      const res = await uploadFile(file)
      const url =
        name === 'trailer_url' || name === 'video_url' ? getStreamUrl(res.id) : getFileUrl(res.id)
      form.setValue(name, url)
      toast.success('File uploaded')
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
          <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-md border">
            {isFetching ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-4 animate-spin" />
              </div>
            ) : name === 'trailer_url' || name === 'video_url' ? (
              displayUrl !== null && displayUrl !== '' ? (
                <video
                  src={displayUrl}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                />
              ) : null
            ) : displayUrl !== null && displayUrl !== '' ? (
              <img src={displayUrl} alt={label} className="h-full w-full object-cover" />
            ) : null}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 z-10 size-6"
              onClick={() => {
                form.setValue(name, '')
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
          accept={name === 'trailer_url' || name === 'video_url' ? 'video/*' : 'image/*'}
        />
      </div>
    </div>
  )
}
