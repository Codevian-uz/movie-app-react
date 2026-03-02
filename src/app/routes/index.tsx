import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  continueWatchingQueryOptions,
  genresQueryOptions,
  moviesQueryOptions,
  myListQueryOptions,
} from '@/features/catalog'
import { MovieHero } from '@/features/catalog/components/Public/MovieHero'
import { MovieRow } from '@/features/catalog/components/Public/MovieRow'
import { PublicHeader } from '@/features/catalog/components/Public/PublicHeader'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { isAuthenticated } = useAuthStore()

  // 1. Fetch Featured/Latest Movies
  const { data: moviesResponse, isLoading: isMoviesLoading } = useQuery(
    moviesQueryOptions({ limit: 20 }),
  )

  // 2. Fetch User State (If authenticated)
  const { data: continueWatchingData } = useQuery({
    ...continueWatchingQueryOptions(),
    enabled: isAuthenticated,
  })
  const { data: myListData } = useQuery({
    ...myListQueryOptions(),
    enabled: isAuthenticated,
  })

  // 3. Fetch Genres to create dynamic rows
  const { data: genresResponse } = useQuery(genresQueryOptions({ page_size: 10 }))

  const movies = moviesResponse?.items ?? []
  const genres = genresResponse?.content ?? []
  const continueWatching = continueWatchingData?.content ?? []
  const myList = myListData?.content ?? []

  const [featuredIndex, setFeaturedIndex] = useState(0)
  const featuredMovie = movies[featuredIndex]

  // Auto-cycle featured anime
  useEffect(() => {
    if (movies.length === 0) {
      return
    }
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % Math.min(movies.length, 5))
    }, 10000)
    return () => {
      clearInterval(interval)
    }
  }, [movies.length])

  if (isMoviesLoading) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-[#141414]">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-red-600" />
      </div>
    )
  }

  // Empty State: If no movies in database
  if (movies.length === 0) {
    return (
      <div className="relative min-h-svh bg-[#141414] text-white">
        <PublicHeader />
        <div className="flex h-[80vh] flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="mb-4 text-3xl font-bold">Your Catalog is Empty</h2>
            <p className="mb-8 text-gray-400">
              Start building your anime empire by adding movies and series via the admin panel.
            </p>
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link to="/admin/catalog/movies" search={{ page: undefined, pageSize: undefined }}>
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Anime
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#141414] text-white">
      <PublicHeader />

      <main className="relative pb-24">
        {featuredMovie !== undefined && <MovieHero movie={featuredMovie} />}

        <div className="relative z-20 -mt-32 space-y-8 md:space-y-16">
          {/* 1. Continue Watching (Authenticated) */}
          {continueWatching.length > 0 && (
            <MovieRow
              title="Continue Watching"
              movies={continueWatching.map((cw) => ({
                ...cw.movie,
                progress:
                  cw.movie.duration_minutes !== null && cw.movie.duration_minutes > 0
                    ? (cw.progress_seconds / (cw.movie.duration_minutes * 60)) * 100
                    : 0,
              }))}
            />
          )}

          {/* 2. My List (Authenticated) */}
          {myList.length > 0 && <MovieRow title="My List" movies={myList} />}

          {/* 3. Trending (Latest Added) */}
          <MovieRow title="Trending Now" movies={movies.slice(0, 10)} />

          {/* 4. Dynamic Genre Rows */}
          {genres.map((genre) => (
            <GenreRow key={genre.id} genreId={genre.id} title={genre.name} />
          ))}

          {/* 5. Watch Again (Randomized/Reverse order) */}
          <MovieRow title="Watch Again" movies={[...movies].reverse().slice(0, 10)} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-white/10 px-6 py-10 text-gray-500 lg:px-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:max-w-4xl">
          <div className="flex flex-col gap-2">
            <span className="cursor-pointer text-xs hover:underline md:text-sm">
              Audio Description
            </span>
            <span className="cursor-pointer text-xs hover:underline md:text-sm">Help Center</span>
            <span className="cursor-pointer text-xs hover:underline md:text-sm">Gift Cards</span>
            <span className="cursor-pointer text-xs hover:underline md:text-sm">Media Center</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="cursor-pointer text-xs hover:underline md:text-sm">
              Investor Relations
            </span>
            <span className="cursor-pointer text-xs hover:underline md:text-sm">Jobs</span>
            <span className="cursor-pointer text-xs hover:underline md:text-sm">Terms of Use</span>
            <span className="cursor-pointer text-xs hover:underline md:text-sm">Privacy</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="cursor-pointer text-xs hover:underline md:text-sm">Legal Notices</span>
            <span className="cursor-pointer text-xs hover:underline md:text-sm">
              Cookie Preferences
            </span>
            <span className="cursor-pointer text-xs hover:underline md:text-sm">
              Corporate Information
            </span>
            <span className="cursor-pointer text-xs hover:underline md:text-sm">Contact Us</span>
          </div>
        </div>
        <div className="mt-8 text-[10px]">© 1997-{new Date().getFullYear()} AnimeApp, Inc.</div>
      </footer>
    </div>
  )
}

// Helper component to fetch movies for a specific genre
function GenreRow({ genreId, title }: { genreId: string; title: string }) {
  const { data } = useQuery(moviesQueryOptions({ genre_id: genreId, limit: 10 }))
  const movies = data?.items ?? []

  if (movies.length === 0) {
    return null
  }

  return <MovieRow title={title} movies={movies} />
}
