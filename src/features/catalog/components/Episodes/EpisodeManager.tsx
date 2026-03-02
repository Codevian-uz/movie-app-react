import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Loader2, Pencil, Play, Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FileUploadField } from '@/features/filevault'
import { episodesQueryOptions, useDeleteEpisode, useUpsertEpisode } from '../../api/catalog.queries'
import type { Episode } from '../../types/catalog.types'

const episodeSchema = z.object({
  id: z.string().optional(),
  movie_id: z.string(),
  season_number: z.coerce.number().min(0),
  episode_number: z.coerce.number().min(1),
  title: z.string().min(1, 'Title is required').max(255),
  video_url: z.string().optional().or(z.literal('')),
  duration_minutes: z.coerce.number().min(1).optional(),
})

type EpisodeFormValues = z.infer<typeof episodeSchema>

const bulkAddSchema = z.object({
  season_number: z.coerce.number().min(0),
  start_episode: z.coerce.number().min(1),
  count: z.coerce.number().min(1).max(50),
  default_duration: z.coerce.number().min(1).default(24),
})

type BulkAddValues = z.infer<typeof bulkAddSchema>

interface EpisodeManagerProps {
  movieId: string
}

export function EpisodeManager({ movieId }: EpisodeManagerProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null)
  const [openSeasons, setOpenSeasons] = useState<Record<number, boolean>>({ 1: true })

  const { data: episodes, isLoading } = useQuery(episodesQueryOptions({ movie_id: movieId }))
  const upsertEpisode = useUpsertEpisode()
  const deleteEpisode = useDeleteEpisode(movieId)

  // Group episodes by season
  const groupedEpisodes = useMemo(() => {
    const groups: Record<number, Episode[]> = {}
    if (!episodes) {
      return groups
    }

    episodes.forEach((ep) => {
      groups[ep.season_number] ??= []
      groups[ep.season_number]?.push(ep)
    })

    // Sort episodes within seasons
    Object.keys(groups).forEach((season) => {
      const seasonNum = Number(season)
      const seasonEpisodes = groups[seasonNum]
      if (seasonEpisodes) {
        seasonEpisodes.sort((a, b) => a.episode_number - b.episode_number)
      }
    })

    return groups
  }, [episodes])

  const seasons = useMemo(() => {
    return Object.keys(groupedEpisodes)
      .map(Number)
      .sort((a, b) => a - b)
  }, [groupedEpisodes])

  const nextEpisodeInfo = useMemo(() => {
    if (!episodes || episodes.length === 0) {
      return { season: 1, episode: 1 }
    }
    const lastSeason = Math.max(...episodes.map((e) => e.season_number))
    const lastEpisodeInSeason = Math.max(
      ...episodes.filter((e) => e.season_number === lastSeason).map((e) => e.episode_number),
    )
    return { season: lastSeason, episode: lastEpisodeInSeason + 1 }
  }, [episodes])

  const form = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      movie_id: movieId,
      season_number: nextEpisodeInfo.season,
      episode_number: nextEpisodeInfo.episode,
      title: '',
      video_url: '',
      duration_minutes: 24,
    },
  })

  const bulkForm = useForm<BulkAddValues>({
    resolver: zodResolver(bulkAddSchema),
    defaultValues: {
      season_number: nextEpisodeInfo.season,
      start_episode: nextEpisodeInfo.episode,
      count: 12,
      default_duration: 24,
    },
  })

  function toggleSeason(season: number) {
    setOpenSeasons((prev) => ({ ...prev, [season]: !(prev[season] ?? false) }))
  }

  function onEditOpenChange(open: boolean) {
    setIsEditOpen(open)
    if (!open) {
      setEditingEpisode(null)
      form.reset({
        movie_id: movieId,
        season_number: nextEpisodeInfo.season,
        episode_number: nextEpisodeInfo.episode,
        title: '',
        video_url: '',
        duration_minutes: 24,
      })
    }
  }

  function handleEdit(episode: Episode) {
    setEditingEpisode(episode)
    form.reset({
      id: episode.id,
      movie_id: episode.movie_id,
      season_number: episode.season_number,
      episode_number: episode.episode_number,
      title: episode.title,
      video_url: episode.video_url ?? '',
      duration_minutes: episode.duration_minutes ?? 24,
    })
    setIsEditOpen(true)
  }

  async function onEditSubmit(values: EpisodeFormValues) {
    try {
      await upsertEpisode.mutateAsync(values)
      toast.success(editingEpisode !== null ? 'Episode updated' : 'Episode created')
      onEditOpenChange(false)
    } catch {
      toast.error('Failed to save episode')
    }
  }

  async function onBulkSubmit(values: BulkAddValues) {
    try {
      const promises = []
      for (let i = 0; i < values.count; i++) {
        const episodeNum = values.start_episode + i
        promises.push(
          upsertEpisode.mutateAsync({
            movie_id: movieId,
            season_number: values.season_number,
            episode_number: episodeNum,
            title: `Episode ${episodeNum.toString()}`,
            duration_minutes: values.default_duration,
          }),
        )
      }
      await Promise.all(promises)
      toast.success(`Created ${values.count.toString()} episodes`)
      setIsBulkOpen(false)
    } catch {
      toast.error('Failed to create some episodes')
    }
  }

  async function handleDelete(id: string) {
    // eslint-disable-next-line no-alert
    if (!confirm('Are you sure you want to delete this episode?')) {
      return
    }
    try {
      await deleteEpisode.mutateAsync(id)
      toast.success('Episode deleted')
    } catch {
      toast.error('Failed to delete episode')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Episodes Management</h3>
          <p className="text-muted-foreground text-sm">
            Organize series into seasons and episodes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsBulkOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Bulk Add
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setIsEditOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Episode
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : seasons.length > 0 ? (
          seasons.map((season) => (
            <Collapsible
              key={season}
              open={openSeasons[season] ?? false}
              onOpenChange={() => {
                toggleSeason(season)
              }}
              className="bg-card overflow-hidden rounded-lg border shadow-xs"
            >
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="hover:bg-accent/50 flex w-full cursor-pointer items-center justify-between p-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {openSeasons[season] === true ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <h4 className="text-foreground font-bold">Season {season.toString()}</h4>
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                      {(groupedEpisodes[season]?.length ?? 0).toString()} Episodes
                    </span>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="divide-y border-t">
                  {groupedEpisodes[season]?.map((episode) => (
                    <div
                      key={episode.id}
                      className="hover:bg-accent/30 group flex items-center justify-between p-4 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                          <Play className="text-muted-foreground h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-red-600">
                              E{episode.episode_number.toString()}
                            </span>
                            {typeof episode.duration_minutes === 'number' && (
                              <span className="text-muted-foreground text-xs font-medium">
                                • {episode.duration_minutes.toString()}m
                              </span>
                            )}
                            {episode.video_url === null || episode.video_url === '' ? (
                              <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-amber-700 uppercase dark:bg-amber-900/30 dark:text-amber-400">
                                No Video
                              </span>
                            ) : null}
                          </div>
                          <h5 className="text-sm font-semibold">{episode.title}</h5>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            handleEdit(episode)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive h-8 w-8"
                          onClick={() => {
                            void handleDelete(episode.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        ) : (
          <div className="border-muted-foreground/20 bg-muted/20 flex h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center">
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
              <Play className="text-muted-foreground h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">No episodes found</p>
              <p className="text-muted-foreground text-sm">
                Start adding episodes individually or use the Bulk Add tool.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingEpisode !== null ? 'Edit Episode' : 'Add New Episode'}
            </DialogTitle>
            <DialogDescription>
              Provide video content and metadata for this episode.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                void form.handleSubmit(onEditSubmit)(e)
              }}
              className="space-y-6 pt-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="season_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="episode_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Episode Number</FormLabel>
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. The Beginning" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FileUploadField name="video_url" label="Video File" form={form} type="video" />

              <DialogFooter>
                <Button type="submit" disabled={upsertEpisode.isPending}>
                  {upsertEpisode.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingEpisode !== null ? 'Save Changes' : 'Add Episode'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Add Episodes</DialogTitle>
            <DialogDescription>
              Quickly generate placeholders for multiple episodes. You can upload videos later.
            </DialogDescription>
          </DialogHeader>
          <Form {...bulkForm}>
            <form
              onSubmit={(e) => {
                void bulkForm.handleSubmit(onBulkSubmit)(e)
              }}
              className="space-y-4"
            >
              <FormField
                control={bulkForm.control}
                name="season_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bulkForm.control}
                  name="start_episode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start from Episode #</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bulkForm.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Episodes</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Max 50 at a time</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={bulkForm.control}
                name="default_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Duration (mins)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={upsertEpisode.isPending}>
                  {upsertEpisode.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Episodes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
