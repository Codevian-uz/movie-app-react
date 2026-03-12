import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { z } from 'zod'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { Button } from '@/components/ui/button'
import {
  genresQueryOptions,
  HomeSection,
  moviesQueryOptions,
  PublicHeader,
} from '@/features/catalog'
import { cn } from '@/lib/utils'

const moviesSearchSchema = z.object({
  search: z.string().optional(),
  genreId: z.string().optional(),
  kind: z.enum(['movie', 'series']).optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sort: z.string().optional(),
})

type MoviesSearch = z.infer<typeof moviesSearchSchema>

export const Route = createFileRoute('/movies/')({
  validateSearch: (search) => moviesSearchSchema.parse(search),
  component: MoviesPage,
})

function MoviesPage() {
  const { search, genreId, kind, page = 1, pageSize = 24, sort = '-created_at' } = Route.useSearch()
  const navigate = useNavigate()

  const { data: moviesData, isLoading } = useQuery(
    moviesQueryOptions({
      search,
      genre_id: genreId,
      kind,
      page_number: page,
      page_size: pageSize,
      sort,
    }),
  )

  const { data: genresData } = useQuery(genresQueryOptions())
  const genres = genresData?.content ?? []

  const movies = moviesData?.content ?? []
  const totalCount = moviesData?.count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const query = formData.get('search') as string
    void navigate({
      to: '/movies',
      search: (prev: MoviesSearch) => ({ ...prev, search: query || undefined, page: 1 }),
    })
  }

  const clearFilters = () => {
    void navigate({
      to: '/movies',
      search: { page: 1, pageSize: 24, sort: '-created_at' },
    })
  }

  const isFiltered =
    (search ?? '') !== '' || genreId !== undefined || kind !== undefined || page !== 1

  return (
    <div className="min-h-svh bg-zinc-950 text-zinc-100">
      <PublicHeader />

      <main className="container mx-auto px-6 pt-28 pb-20 lg:px-12">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              {(search ?? '') !== ''
                ? `Search: ${search ?? ''}`
                : genreId !== undefined
                  ? 'Genre'
                  : (kind ?? 'Browse All')}
            </h1>
            <p className="mt-2 text-zinc-500">
              {totalCount} {totalCount === 1 ? 'title' : 'titles'} found
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by title, character..."
              className="h-12 w-full rounded-full border border-zinc-800 bg-zinc-900/50 pl-12 text-white focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
            />
          </form>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Filters Sidebar */}
          <aside className="space-y-8 lg:col-span-3">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-white">
                  <SlidersHorizontal className="h-4 w-4 text-orange-500" />
                  Filters
                </h3>
                {isFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-xs text-zinc-500 hover:text-orange-500"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Kind */}
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['movie', 'series'] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() =>
                          void navigate({
                            to: '/movies',
                            search: (prev: MoviesSearch) => ({
                              ...prev,
                              kind: kind === k ? undefined : k,
                              page: 1,
                            }),
                          })
                        }
                        className={cn(
                          'rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                          kind === k
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200',
                        )}
                      >
                        {k.charAt(0).toUpperCase() + k.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Genres */}
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    Genres
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => (
                      <button
                        key={g.id}
                        onClick={() =>
                          void navigate({
                            to: '/movies',
                            search: (prev: MoviesSearch) => ({
                              ...prev,
                              genreId: genreId === g.id ? undefined : g.id,
                              page: 1,
                            }),
                          })
                        }
                        className={cn(
                          'rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                          genreId === g.id
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200',
                        )}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    Sort By
                  </label>
                  <select
                    value={sort}
                    onChange={(e) =>
                      void navigate({
                        to: '/movies',
                        search: (prev: MoviesSearch) => ({
                          ...prev,
                          sort: e.target.value,
                          page: 1,
                        }),
                      })
                    }
                    className="w-full rounded-lg border-zinc-800 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
                  >
                    <option value="-created_at">Newest First</option>
                    <option value="created_at">Oldest First</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="-title">Title (Z-A)</option>
                    <option value="-rating_average">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Movies Grid */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-2/3 animate-pulse rounded-xl bg-zinc-900" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-900" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-900" />
                  </div>
                ))}
              </div>
            ) : movies.length > 0 ? (
              <div className="space-y-12">
                <HomeSection title="" movies={movies} className="space-y-0!" />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() =>
                        void navigate({
                          to: '/movies',
                          search: (prev: MoviesSearch) => ({ ...prev, page: page - 1 }),
                        })
                      }
                      className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2 px-4 text-sm font-bold text-zinc-500">
                      Page <span className="text-white">{page}</span> of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() =>
                        void navigate({
                          to: '/movies',
                          search: (prev: MoviesSearch) => ({ ...prev, page: page + 1 }),
                        })
                      }
                      className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 text-center">
                <div className="mb-4 rounded-full bg-zinc-900/50 p-6">
                  <X className="h-10 w-10 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-white">No results found</h3>
                <p className="mt-2 text-zinc-500">Try adjusting your filters or search terms.</p>
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="mt-4 text-orange-500 hover:text-orange-400"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
