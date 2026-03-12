import { useQuery } from '@tanstack/react-query'
import type { Query } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  VideoPlayer,
  ProcessingState,
  ErrorState,
  streamManifestQueryOptions,
  movieQueryOptions,
  PublicHeader,
} from '@/features/catalog'
import type { StreamManifest } from '@/features/catalog'
import { statusQueryOptions } from '@/features/interactions'
import { useAuthStore } from '@/stores/auth.store'

const watchSearchSchema = z.object({
  episodeId: z.string().optional(),
})

export const Route = createFileRoute('/watch/$movieId')({
  validateSearch: (search) => watchSearchSchema.parse(search),
  component: WatchPage,
})

function WatchPage() {
  const { movieId } = Route.useParams()
  const { episodeId } = Route.useSearch()
  const { isAuthenticated } = useAuthStore()

  const { data: movie } = useQuery(movieQueryOptions(movieId))

  const { data: status } = useQuery({
    ...statusQueryOptions({ target_type: 'movie', target_id: movieId }),
    enabled: isAuthenticated,
  })

  const {
    data: manifest,
    refetch,
    isLoading,
  } = useQuery<StreamManifest | null>({
    ...streamManifestQueryOptions({
      movie_id: episodeId === undefined || episodeId === '' ? movieId : undefined,
      episode_id: episodeId !== undefined && episodeId !== '' ? episodeId : undefined,
    }),
    refetchInterval: (query: Query<StreamManifest | null>) => {
      const data = query.state.data
      const sources = data?.sources ?? []
      const isReady = sources.some((s) => s.processing_status === 'ready')
      if (sources.length > 0 && !isReady) {
        return 5000 // Poll every 5s if transcoding
      }
      return false
    },
  })

  const sources = manifest?.sources ?? []
  const readySources = sources.filter((s) => s.processing_status === 'ready')
  const processingSources = sources.filter((s) => s.processing_status === 'processing')
  const failedSources = sources.filter((s) => s.processing_status === 'failed')

  // Prioritize Ready sources, but fallback to any MP4 source if nothing else is ready
  const primarySource =
    readySources.length > 0
      ? (readySources.find((s) => s.id === manifest?.primary_source_id) ?? readySources[0])
      : sources.find((s) => s.type === 'mp4')

  return (
    <div className="relative min-h-svh bg-zinc-950 text-zinc-100">
      <PublicHeader />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex flex-col gap-6">
          <Button
            asChild
            variant="ghost"
            className="w-fit text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <Link to="/movies/$movieId" params={{ movieId }}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Details
            </Link>
          </Button>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              {movie?.title}
            </h1>
            {episodeId !== undefined && episodeId !== '' && (
              <p className="text-lg font-medium text-zinc-400">Watching Episode {episodeId}</p>
            )}
          </div>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
          {isLoading ? (
            <ProcessingState />
          ) : primarySource !== undefined ? (
            <VideoPlayer
              url={primarySource.url}
              poster={movie?.backdrop_url ?? undefined}
              movieId={movieId}
              episodeId={episodeId}
              initialProgress={status?.progress?.progress_seconds}
            />
          ) : processingSources.length > 0 || sources.length === 0 ? (
            <ProcessingState />
          ) : failedSources.length > 0 ? (
            <ErrorState
              message="Transcoding failed for this video"
              onRetry={() => {
                void refetch()
              }}
              onReport={() => {
                window.open('https://github.com/Jaxongir1006/movie-app-react/issues/new', '_blank')
              }}
            />
          ) : (
            <ErrorState
              message="No streamable sources found"
              onRetry={() => {
                void refetch()
              }}
              onReport={() => {
                window.open('https://github.com/Jaxongir1006/movie-app-react/issues/new', '_blank')
              }}
            />
          )}
        </div>

        {movie?.description !== null &&
          movie?.description !== undefined &&
          movie.description !== '' && (
            <div className="mt-12 max-w-3xl space-y-4">
              <h3 className="text-xl font-bold text-white">About this {movie.kind}</h3>
              <p className="leading-relaxed text-zinc-400">{movie.description}</p>
            </div>
          )}
      </main>
    </div>
  )
}
