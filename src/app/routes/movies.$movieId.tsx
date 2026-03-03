import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  titleDetailsQueryOptions,
  MovieDetailsHero,
  MovieCast,
  SeriesEpisodes,
  MovieRow,
} from '@/features/catalog'

export const Route = createFileRoute('/movies/$movieId')({
  component: MovieDetailsPage,
})

function MovieDetailsPage() {
  const { movieId } = Route.useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery(titleDetailsQueryOptions(movieId))

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-red-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-black text-white">
        <h1 className="text-3xl font-bold">Movie Not Found</h1>
        <p className="text-gray-400">
          The title you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => {
            void navigate({ to: '/' })
          }}
          className="cursor-pointer rounded bg-red-600 px-6 py-2 transition hover:bg-red-700"
        >
          Go Home
        </button>
      </div>
    )
  }

  const { movie, genres, credits, seasons, recommendations } = data

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
  }))

  return (
    <div className="min-h-screen bg-black text-white md:pl-64">
      {/* 
        The layout assumes a sidebar which typically adds padding. 
        If the app shell already gives padding, we adjust. 
        Wait, observing the aesthetic choices, it seems page contents don't need hardcoded md:pl-64 if the layout provides it.
        Let's remove md:pl-64 and rely on AppLayout.
      */}
      <div className="flex flex-col gap-12 pb-20">
        <MovieDetailsHero movie={movie} genres={genres} />

        <div className="container mx-auto space-y-16 px-6 md:px-12">
          <MovieCast credits={credits} />

          {movie.kind === 'series' && seasons && (
            <SeriesEpisodes seasons={seasons} movieId={movie.id} />
          )}

          {recommendations.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">More Like This</h2>
              {/* Using the existing MovieRow which expects Movie[] array */}
              <div className="-mx-6 md:-mx-12">
                <MovieRow title="" movies={recommendationMovies} />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
