import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  titleDetailsQueryOptions,
  MovieDetailsHero,
  MovieCast,
  SeriesEpisodes,
  MovieRow,
  VideoPlayer,
  streamManifestQueryOptions,
  ProcessingState,
  ErrorState,
} from '@/features/catalog'
import { MovieComments, statusQueryOptions } from '@/features/interactions'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

const movieDetailsSearchSchema = z.object({
  autoplay: z.boolean().optional(),
  episodeId: z.string().optional(),
  tab: z.enum(['episodes', 'cast', 'comments', 'more']).optional(),
  isTrailer: z.boolean().optional(),
})

export const Route = createFileRoute('/movies/$movieId')({
  validateSearch: (search) => movieDetailsSearchSchema.parse(search),
  component: MovieDetailsPage,
})

function MovieDetailsPage() {
  const { movieId } = Route.useParams()
  const { episodeId, tab = 'episodes', isTrailer = false } = Route.useSearch()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)

  const { data, isLoading, error } = useQuery(titleDetailsQueryOptions(movieId, episodeId))
  const { data: status } = useQuery({
    ...statusQueryOptions({ target_type: 'movie', target_id: movieId }),
    enabled: isAuthenticated,
  })

  const {
    data: manifest,
    isLoading: isManifestLoading,
    refetch: refetchManifest,
  } = useQuery(
    streamManifestQueryOptions({
      movie_id: movieId,
      episode_id: episodeId,
      is_trailer: isTrailer,
    }),
  )

  // Intersection Observer to handle sticky/mini player transition
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsSticky(!entry.isIntersecting)
        }
      },
      { threshold: 0 },
    )

    const currentRef = playerContainerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-orange-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-zinc-950 text-white">
        <h1 className="text-3xl font-bold">Movie Not Found</h1>
        <p className="text-zinc-400">
          The title you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => {
            void navigate({ to: '/' })
          }}
          className="cursor-pointer rounded-full bg-orange-500 px-8 py-3 font-bold transition hover:bg-orange-600"
        >
          Go Home
        </button>
      </div>
    )
  }

  const { movie, genres, credits, seasons, recommendations } = data

  const sources = manifest?.sources ?? []
  const readySources = sources.filter((s) => s.processing_status === 'ready')
  const processingSources = sources.filter((s) => s.processing_status === 'processing')
  const failedSources = sources.filter((s) => s.processing_status === 'failed')

  const primarySource =
    readySources.length > 0
      ? (readySources.find((s) => s.id === manifest?.primary_source_id) ?? readySources[0])
      : sources.find((s) => s.type === 'mp4')

  const recommendationMovies = recommendations.map((r) => ({
    ...r,
    kind: 'movie' as const,
    description: null,
    backdrop_url: null,
    trailer_url: null,
    video_url: null,
    release_date: null,
    duration_minutes: null,
    vote_count: 0,
    created_at: '',
    updated_at: '',
    deleted_at: null,
    collection_id: null,
    collection_order: null,
    status: 'finished',
  }))

  const handlePlayNext = () => {
    if (movie.kind !== 'series' || !seasons) {
      return
    }

    const allEpisodes = seasons.flatMap((s) => s.episodes)
    const currentIndex = allEpisodes.findIndex((e) => e.id === episodeId)
    const nextEpisode = allEpisodes[currentIndex + 1]
    if (nextEpisode) {
      void navigate({
        to: '/movies/$movieId',
        params: { movieId },
        search: { autoplay: true, episodeId: nextEpisode.id },
      })
    }
  }

  const handleTabChange = (value: string) => {
    void navigate({
      to: '/movies/$movieId',
      params: { movieId },
      search: (prev) => ({ ...prev, tab: value as 'episodes' | 'cast' | 'comments' | 'more' }),
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* 16:9 Aspect Ratio Container for the player */}
      <div
        ref={playerContainerRef}
        className="relative aspect-video w-full overflow-hidden bg-black shadow-2xl"
      >
        <div
          className={cn(
            'h-full w-full transition-all duration-500',
            isSticky
              ? 'fixed top-0 right-0 left-0 z-50 flex h-auto max-h-[40vh] items-center justify-center bg-zinc-950/95 shadow-2xl backdrop-blur-xl'
              : 'relative',
          )}
        >
          <div className={cn('h-full w-full', isSticky && 'container mx-auto aspect-video')}>
            {isManifestLoading ? (
              <ProcessingState />
            ) : primarySource !== undefined ? (
              <VideoPlayer
                url={primarySource.url}
                poster={movie.backdrop_url ?? undefined}
                movieId={movieId}
                episodeId={episodeId}
                initialProgress={status?.progress?.progress_seconds}
                onEnded={handlePlayNext}
              />
            ) : processingSources.length > 0 || sources.length === 0 ? (
              <ProcessingState />
            ) : failedSources.length > 0 ? (
              <ErrorState
                message="Transcoding failed for this video"
                onRetry={() => {
                  void refetchManifest()
                }}
              />
            ) : (
              <ErrorState
                message="No streamable sources found"
                onRetry={() => {
                  void refetchManifest()
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0 pb-20">
        <MovieDetailsHero movie={movie} genres={genres} />

        <div className="container mx-auto px-6 md:px-12">
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-12 inline-flex h-auto w-full items-center justify-start gap-8 rounded-none border-b border-white/5 bg-transparent p-0">
              {movie.kind === 'series' && (
                <TabsTrigger
                  value="episodes"
                  className="relative h-12 rounded-none border-b-2 border-transparent px-1 pt-2 pb-4 text-base font-bold transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:after:bg-orange-500"
                >
                  Episodes
                </TabsTrigger>
              )}
              <TabsTrigger
                value="cast"
                className="relative h-12 rounded-none border-b-2 border-transparent px-1 pt-2 pb-4 text-base font-bold transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:after:bg-orange-500"
              >
                Cast & Crew
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="relative h-12 rounded-none border-b-2 border-transparent px-1 pt-2 pb-4 text-base font-bold transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:after:bg-orange-500"
              >
                Comments
              </TabsTrigger>
              {recommendations.length > 0 && (
                <TabsTrigger
                  value="more"
                  className="relative h-12 rounded-none border-b-2 border-transparent px-1 pt-2 pb-4 text-base font-bold transition-all data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:after:bg-orange-500"
                >
                  More Like This
                </TabsTrigger>
              )}
            </TabsList>

            <div className="min-h-[400px]">
              {movie.kind === 'series' && seasons && (
                <TabsContent value="episodes" className="mt-0 focus-visible:outline-none">
                  <SeriesEpisodes seasons={seasons} movieId={movie.id} />
                </TabsContent>
              )}

              <TabsContent value="cast" className="mt-0 focus-visible:outline-none">
                <MovieCast credits={credits} />
              </TabsContent>

              <TabsContent value="comments" className="mt-0 focus-visible:outline-none">
                <MovieComments movieId={movie.id} />
              </TabsContent>

              {recommendations.length > 0 && (
                <TabsContent value="more" className="mt-0 focus-visible:outline-none">
                  <section className="space-y-8">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-bold tracking-tight text-white">
                        More Like This
                      </h2>
                      <p className="text-sm text-zinc-400">Recommended based on your interests</p>
                    </div>
                    <div className="-mx-6 md:-mx-12">
                      <MovieRow title="" movies={recommendationMovies} />
                    </div>
                  </section>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
