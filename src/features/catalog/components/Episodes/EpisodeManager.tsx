import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Loader2, Play } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { episodesQueryOptions, useUpsertEpisode, useDeleteEpisode } from '../../api/catalog.queries'
import type { Episode } from '../../types/catalog.types'

const episodeSchema = z.object({
  id: z.string().optional(),
  movie_id: z.string(),
  season_number: z.coerce.number().min(0),
  episode_number: z.coerce.number().min(1),
  title: z.string().min(1).max(255),
  video_url: z.string().url().optional().or(z.literal('')),
  duration_minutes: z.coerce.number().min(1).optional(),
})

type EpisodeFormValues = z.infer<typeof episodeSchema>

interface EpisodeManagerProps {
  movieId: string
}

export function EpisodeManager({ movieId }: EpisodeManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null)

  const { data: episodes, isLoading } = useQuery(episodesQueryOptions({ movie_id: movieId }))
  const upsertEpisode = useUpsertEpisode()
  const deleteEpisode = useDeleteEpisode(movieId)

  const form = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      movie_id: movieId,
      season_number: 1,
      episode_number: (episodes?.length ?? 0) + 1,
      title: '',
      video_url: '',
      duration_minutes: 24,
    },
  })

  function onOpenChange(open: boolean) {
    setIsOpen(open)
    if (!open) {
      setEditingEpisode(null)
      form.reset({
        movie_id: movieId,
        season_number: 1,
        episode_number: (episodes?.length ?? 0) + 1,
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
    setIsOpen(true)
  }

  async function onSubmit(values: EpisodeFormValues) {
    try {
      await upsertEpisode.mutateAsync(values)
      toast.success(editingEpisode !== null ? 'Episode updated' : 'Episode created')
      onOpenChange(false)
    } catch {
      toast.error('Failed to save episode')
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Episodes</h3>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Episode
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEpisode !== null ? 'Edit Episode' : 'Add New Episode'}
              </DialogTitle>
              <DialogDescription>Fill in the details for the episode.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  void form.handleSubmit(onSubmit)(e)
                }}
                className="space-y-4"
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
                        <FormLabel>Episode #</FormLabel>
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
                        <Input placeholder="Episode title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
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
                      <FormLabel>Duration (mins)</FormLabel>
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
                    {editingEpisode !== null ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-md border">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : episodes && episodes.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="hover:bg-accent/50 flex items-center justify-between p-4 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                      <Play className="text-muted-foreground h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                          S{episode.season_number.toString()} E{episode.episode_number.toString()}
                        </span>
                        {typeof episode.duration_minutes === 'number' && (
                          <span className="text-muted-foreground text-xs">
                            • {episode.duration_minutes.toString()}m
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium">{episode.title}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        handleEdit(episode)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        void handleDelete(episode.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-muted-foreground flex h-32 flex-col items-center justify-center gap-2">
            <p>No episodes added yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
