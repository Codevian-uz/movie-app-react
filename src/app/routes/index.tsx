import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  homeDataQueryOptions,
  HomeSpotlight,
  HomeSection,
  HomeSidebar,
  ContinueWatchingRow,
  PublicHeader,
} from '@/features/catalog'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { data: homeData, isLoading } = useQuery(homeDataQueryOptions())

  if (isLoading) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-orange-500" />
      </div>
    )
  }

  const trending = homeData?.trending ?? []
  const popular = homeData?.popular ?? []
  const newReleases = homeData?.new_releases ?? []
  const continueWatching = homeData?.continue_watching ?? []
  const myList = homeData?.my_list ?? []
  const genres = homeData?.genres ?? []

  // Empty State: If no movies in database
  if (trending.length === 0 && popular.length === 0 && newReleases.length === 0) {
    return (
      <div className="relative min-h-svh bg-zinc-950 text-white">
        <PublicHeader />
        <div className="flex h-[80vh] flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-zinc-800 p-4">
                <LayoutGrid className="h-12 w-12 text-zinc-600" />
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Catalog is Empty</h2>
            <p className="mb-8 text-zinc-400">
              No anime found. Start building your collection via the admin panel.
            </p>
            <Button
              asChild
              size="lg"
              className="w-full bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
            >
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
    <div className="relative min-h-svh overflow-x-hidden bg-zinc-950 text-zinc-100 selection:bg-orange-500/30 selection:text-orange-500">
      <PublicHeader />

      <main className="pb-20">
        {/* Hero Spotlight */}
        <HomeSpotlight movies={trending} />

        <div className="container mt-8 px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Main Content */}
            <div className="space-y-16 lg:col-span-8 xl:col-span-9">
              {/* 1. Continue Watching (Authenticated) */}
              {continueWatching.length > 0 && <ContinueWatchingRow items={continueWatching} />}

              {/* 2. My List (Authenticated) */}
              {myList.length > 0 && <HomeSection title="My List" movies={myList} />}

              {/* 3. New Releases (Latest Episodes) */}
              <HomeSection title="Latest Episodes" movies={newReleases} />

              {/* 4. Most Popular */}
              <HomeSection title="Most Popular" movies={popular} />

              {/* 5. Trending (Grid) */}
              <HomeSection title="Trending Now" movies={trending} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24">
                <HomeSidebar topTen={trending} genres={genres} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-900 bg-zinc-900/30 px-6 py-16 text-zinc-500 lg:px-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold tracking-widest text-zinc-200 uppercase">
                Platform
              </h4>
              <Link to="/" className="text-sm transition-colors hover:text-orange-500">
                Browse
              </Link>
              <Link to="/" className="text-sm transition-colors hover:text-orange-500">
                Genres
              </Link>
              <Link to="/" className="text-sm transition-colors hover:text-orange-500">
                Top Airing
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold tracking-widest text-zinc-200 uppercase">Support</h4>
              <Link to="/" className="text-sm transition-colors hover:text-orange-500">
                Help Center
              </Link>
              <Link to="/" className="text-sm transition-colors hover:text-orange-500">
                Terms of Use
              </Link>
              <Link to="/" className="text-sm transition-colors hover:text-orange-500">
                Privacy Policy
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold tracking-widest text-zinc-200 uppercase">Account</h4>
              <Link to="/login" className="text-sm transition-colors hover:text-orange-500">
                Login
              </Link>
              <Link to="/register" className="text-sm transition-colors hover:text-orange-500">
                Register
              </Link>
              <Link to="/" className="text-sm transition-colors hover:text-orange-500">
                My Profile
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-xl font-black tracking-tighter text-white italic">
                  ANIME<span className="text-orange-500">WATCH</span>
                </div>
                <p className="max-w-200px text-xs leading-relaxed text-zinc-600">
                  The ultimate destination for anime enthusiasts. Watch thousands of episodes for
                  free.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-zinc-900 pt-8 md:flex-row">
            <div className="text-xs">
              © {new Date().getFullYear()} AnimeWatch. All rights reserved.
            </div>
            <div className="flex gap-6">{/* Social icons placeholder */}</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
