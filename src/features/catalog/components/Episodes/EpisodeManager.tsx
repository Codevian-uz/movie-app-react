import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Play,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import { FileUploadField } from '@/features/filevault'
import {
  episodesQueryOptions,
  useDeleteEpisode,
  useUpsertEpisode,
  seasonsQueryOptions,
  useUpsertSeason,
  useDeleteSeason,
} from '../../api/catalog.queries'
import type { Episode, Season } from '../../types/catalog.types'

const seasonSchema = z.object({
  id: z.string().optional(),
  movie_id: z.string(),
  season_number: z.coerce.number().min(0),
  title: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  poster_url: z.string().optional().or(z.literal('')),
  air_date: z.string().optional().or(z.literal('')),
})

type SeasonFormValues = z.infer<typeof seasonSchema>

const episodeSchema = z.object({
  id: z.string().optional(),
  movie_id: z.string(),
  season_number: z.coerce.number().min(0),
  episode_number: z.coerce.number().min(1),
  description: z.string().optional().or(z.literal('')),
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
  const [isSeasonEditOpen, setIsSeasonEditOpen] = useState(false)
  const [isEpisodeEditOpen, setIsEpisodeEditOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [editingSeason, setEditingSeason] = useState<Season | null>(null)
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null)
  const [openSeasons, setOpenSeasons] = useState<Record<string, boolean>>({})

  const { data: seasonsResponse, isLoading: isLoadingSeasons } = useQuery(
    seasonsQueryOptions({ movie_id: movieId }),
  )
  const { data: episodesResponse, isLoading: isLoadingEpisodes } = useQuery(
    episodesQueryOptions({ movie_id: movieId }),
  )

  const upsertSeason = useUpsertSeason()
  const deleteSeason = useDeleteSeason(movieId)
  const upsertEpisode = useUpsertEpisode()
  const deleteEpisode = useDeleteEpisode(movieId)

  const seasons = useMemo(() => seasonsResponse ?? [], [seasonsResponse])
  const episodes = useMemo(() => episodesResponse ?? [], [episodesResponse])

  // Group episodes by season ID
  const groupedEpisodes = useMemo(() => {
    const groups: Record<string, Episode[]> = {}
    episodes.forEach((ep) => {
      groups[ep.season_id] ??= []
      groups[ep.season_id]?.push(ep)
    })

    // Sort episodes within seasons
    Object.keys(groups).forEach((sId) => {
      groups[sId]?.sort((a, b) => a.episode_number - b.episode_number)
    })

    return groups
  }, [episodes])

  const sortedSeasons = useMemo(() => {
    return [...seasons].sort((a, b) => a.season_number - b.season_number)
  }, [seasons])

  const nextInfo = useMemo(() => {
    if (sortedSeasons.length === 0) {
      return { season: 1, episode: 1 }
    }
    const lastSeason = sortedSeasons[sortedSeasons.length - 1]
    if (lastSeason === undefined) {
      return { season: 1, episode: 1 }
    }
    const seasonEpisodes = groupedEpisodes[lastSeason.id] ?? []
    if (seasonEpisodes.length === 0) {
      return { season: lastSeason.season_number, episode: 1 }
    }
    const lastEpisode = seasonEpisodes[seasonEpisodes.length - 1]
    if (lastEpisode === undefined) {
      return { season: lastSeason.season_number, episode: 1 }
    }
    return { season: lastSeason.season_number, episode: lastEpisode.episode_number + 1 }
  }, [sortedSeasons, groupedEpisodes])

  const seasonForm = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
    defaultValues: {
      movie_id: movieId,
      season_number: nextInfo.season,
      title: '',
      description: '',
      poster_url: '',
      air_date: '',
    },
  })

  const episodeForm = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      movie_id: movieId,
      season_number: nextInfo.season,
      episode_number: nextInfo.episode,
      description: '',
      title: '',
      video_url: '',
      duration_minutes: 24,
    },
  })

  const bulkForm = useForm<BulkAddValues>({
    resolver: zodResolver(bulkAddSchema),
    defaultValues: {
      season_number: nextInfo.season,
      start_episode: nextInfo.episode,
      count: 12,
      default_duration: 24,
    },
  })

  function toggleSeason(seasonId: string) {
    setOpenSeasons((prev) => ({ ...prev, [seasonId]: !(prev[seasonId] ?? false) }))
  }

  // Handlers for Season
  function onSeasonEditOpenChange(open: boolean) {
    setIsSeasonEditOpen(open)
    if (!open) {
      setEditingSeason(null)
      seasonForm.reset({
        movie_id: movieId,
        season_number: nextInfo.season,
        title: '',
        description: '',
        poster_url: '',
        air_date: '',
      })
    }
  }

  function handleEditSeason(season: Season) {
    setEditingSeason(season)
    seasonForm.reset({
      id: season.id,
      movie_id: season.movie_id,
      season_number: season.season_number,
      title: season.title ?? '',
      description: season.description ?? '',
      poster_url: season.poster_url ?? '',
      air_date: season.air_date?.split('T')[0] ?? '',
    })
    setIsSeasonEditOpen(true)
  }

  async function onSeasonSubmit(values: SeasonFormValues) {
    try {
      await upsertSeason.mutateAsync({
        ...values,
        air_date:
          values.air_date !== undefined && values.air_date !== ''
            ? new Date(values.air_date).toISOString()
            : undefined,
      })
      toast.success(editingSeason !== null ? 'Season updated' : 'Season created')
      onSeasonEditOpenChange(false)
    } catch {
      toast.error('Failed to save season')
    }
  }

  async function handleDeleteSeason(id: string) {
    // eslint-disable-next-line no-alert
    if (!confirm('Are you sure? This will NOT delete episodes but they will become unlinked.')) {
      return
    }
    try {
      await deleteSeason.mutateAsync(id)
      toast.success('Season deleted')
    } catch {
      toast.error('Failed to delete season')
    }
  }

  // Handlers for Episode
  function onEpisodeEditOpenChange(open: boolean) {
    setIsEpisodeEditOpen(open)
    if (!open) {
      setEditingEpisode(null)
      episodeForm.reset({
        movie_id: movieId,
        season_number: nextInfo.season,
        episode_number: nextInfo.episode,
        title: '',
        description: '',
        video_url: '',
        duration_minutes: 24,
      })
    }
  }

  function handleEditEpisode(episode: Episode, seasonNumber: number) {
    setEditingEpisode(episode)
    episodeForm.reset({
      id: episode.id,
      movie_id: movieId,
      season_number: seasonNumber,
      episode_number: episode.episode_number,
      title: episode.title,
      description: episode.description ?? '',
      video_url: episode.video_url ?? '',
      duration_minutes: episode.duration_minutes ?? 24,
    })
    setIsEpisodeEditOpen(true)
  }

  async function onEpisodeSubmit(values: EpisodeFormValues) {
    try {
      await upsertEpisode.mutateAsync(values)
      toast.success(editingEpisode !== null ? 'Episode updated' : 'Episode created')
      onEpisodeEditOpenChange(false)
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

  async function handleDeleteEpisode(id: string) {
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

  const isLoading = isLoadingSeasons || isLoadingEpisodes

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Seasons & Episodes</h3>
          <p className="text-muted-foreground text-sm">Manage series structure and content.</p>
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
            variant="outline"
            size="sm"
            onClick={() => {
              setIsSeasonEditOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Season
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setIsEpisodeEditOpen(true)
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
        ) : sortedSeasons.length > 0 ? (
          sortedSeasons.map((season) => (
            <Collapsible
              key={season.id}
              open={openSeasons[season.id] ?? false}
              onOpenChange={() => {
                toggleSeason(season.id)
              }}
              className="bg-card overflow-hidden rounded-lg border shadow-xs"
            >
              <div className="hover:bg-accent/50 flex items-center justify-between p-1 pr-4 transition-colors">
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex h-auto flex-1 items-center justify-start gap-3 p-4 text-left"
                  >
                    {openSeasons[season.id] === true ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className="text-foreground font-bold">
                          Season {season.season_number.toString()}
                        </h4>
                        {season.title !== null && season.title !== '' && (
                          <span className="text-muted-foreground font-medium">
                            — {season.title}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="font-medium">
                          {(groupedEpisodes[season.id]?.length ?? 0).toString()} Episodes
                        </Badge>
                        {season.air_date !== null && season.air_date !== '' && (
                          <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                            <Calendar className="h-3 w-3" />
                            {new Date(season.air_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditSeason(season)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      void handleDeleteSeason(season.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <CollapsibleContent>
                <div className="divide-y border-t">
                  {(groupedEpisodes[season.id]?.length ?? 0) > 0 ? (
                    (groupedEpisodes[season.id] ?? []).map((episode) => (
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
                                <Badge
                                  variant="outline"
                                  className="border-amber-200 bg-amber-50 text-[10px] text-amber-600"
                                >
                                  NO VIDEO
                                </Badge>
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
                              handleEditEpisode(episode, season.season_number)
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
                              void handleDeleteEpisode(episode.id)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground p-8 text-center text-sm">
                      No episodes in this season.
                    </div>
                  )}
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
              <p className="font-semibold">No seasons found</p>
              <p className="text-muted-foreground text-sm">
                Start by adding a season or an episode.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Season Edit Dialog */}
      <Dialog open={isSeasonEditOpen} onOpenChange={onSeasonEditOpenChange}>
        <DialogContent className="sm:max-w-500px flex max-h-[90vh] flex-col">
          <DialogHeader>
            <DialogTitle>{editingSeason ? 'Edit Season' : 'Add New Season'}</DialogTitle>
            <DialogDescription>Manage season metadata and appearance.</DialogDescription>
          </DialogHeader>
          <Form {...seasonForm}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void seasonForm.handleSubmit(onSeasonSubmit)(e)
              }}
              className="flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-1 py-4">
                <div className="space-y-4">
                  <FormField
                    control={seasonForm.control}
                    name="season_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Season Number</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={seasonForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Season Title (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Genesis" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={seasonForm.control}
                    name="air_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Air Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={seasonForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Season Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FileUploadField
                    name="poster_url"
                    label="Season Poster"
                    form={seasonForm}
                    aspect="poster"
                  />
                </div>
              </div>
              <DialogFooter className="border-t pt-4">
                <Button type="submit" disabled={upsertSeason.isPending}>
                  {upsertSeason.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSeason ? 'Save Changes' : 'Create Season'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Episode Edit Dialog */}
      <Dialog open={isEpisodeEditOpen} onOpenChange={onEpisodeEditOpenChange}>
        <DialogContent className="sm:max-w-500px flex max-h-[90vh] flex-col">
          <DialogHeader>
            <DialogTitle>{editingEpisode ? 'Edit Episode' : 'Add New Episode'}</DialogTitle>
            <DialogDescription>
              Provide video content and metadata for this episode.
            </DialogDescription>
          </DialogHeader>
          <Form {...episodeForm}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void episodeForm.handleSubmit(onEpisodeSubmit)(e)
              }}
              className="flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-1 py-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={episodeForm.control}
                      name="season_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season Number</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            If season doesn't exist, it will be created.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={episodeForm.control}
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
                    control={episodeForm.control}
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
                  <FormField
                    control={episodeForm.control}
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
                  <FormField
                    control={episodeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FileUploadField
                    name="video_url"
                    label="Video File"
                    form={episodeForm}
                    type="video"
                  />
                </div>
              </div>
              <DialogFooter className="border-t pt-4">
                <Button type="submit" disabled={upsertEpisode.isPending}>
                  {upsertEpisode.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingEpisode ? 'Save Changes' : 'Add Episode'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent className="sm:max-w-500px flex max-h-[90vh] flex-col">
          <DialogHeader>
            <DialogTitle>Bulk Add Episodes</DialogTitle>
            <DialogDescription>
              Quickly generate placeholders for multiple episodes.
            </DialogDescription>
          </DialogHeader>
          <Form {...bulkForm}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void bulkForm.handleSubmit(onBulkSubmit)(e)
              }}
              className="flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-1 py-4">
                <div className="space-y-4">
                  <FormField
                    control={bulkForm.control}
                    name="season_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Season Number</FormLabel>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="border-t pt-4">
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
