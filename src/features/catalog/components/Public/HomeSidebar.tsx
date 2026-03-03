import { Link } from '@tanstack/react-router'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Movie, Genre } from '../../types/catalog.types'

interface HomeSidebarProps {
  topTen: Movie[]
  genres: Genre[]
  className?: string
}

export function HomeSidebar({ topTen, genres, className }: HomeSidebarProps) {
  return (
    <aside className={cn('space-y-10', className)}>
      {/* Top 10 List */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-white">
          <span className="mr-3 border-l-4 border-orange-500 pl-3 uppercase">Top 10</span>
        </h2>
        <div className="flex flex-col gap-2">
          {topTen.slice(0, 10).map((movie, index) => (
            <Link
              key={movie.id}
              to="/movies/$movieId"
              params={{ movieId: movie.id }}
              className="group flex items-center gap-4 rounded-lg p-2 transition-all hover:bg-zinc-900"
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-black italic shadow-inner',
                  index === 0
                    ? 'bg-orange-500 text-white'
                    : index === 1
                      ? 'bg-zinc-800 text-orange-500'
                      : index === 2
                        ? 'bg-zinc-800 text-orange-400'
                        : 'bg-zinc-900 text-zinc-600',
                )}
              >
                {index + 1}
              </div>
              <div className="relative aspect-2/3 h-16 shrink-0 overflow-hidden rounded shadow-md">
                <img
                  src={movie.poster_url ?? '/placeholder-poster.jpg'}
                  alt={movie.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="h-6 w-6 fill-white text-white" />
                </div>
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <h3 className="line-clamp-1 text-sm font-bold text-zinc-200 transition-colors group-hover:text-orange-500">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span>{movie.kind}</span>
                  <span>•</span>
                  <span className="text-orange-400">
                    ★{' '}
                    {typeof movie.rating_average === 'number'
                      ? movie.rating_average.toFixed(1)
                      : '0.0'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Genres */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-white">
          <span className="mr-3 border-l-4 border-orange-500 pl-3 uppercase">Genres</span>
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {genres.map((genre) => (
            <Link
              key={genre.id}
              to="/" // TODO: Link to genre page
              className="rounded bg-zinc-900 px-3 py-2 text-center text-xs font-semibold text-zinc-400 transition-all hover:bg-orange-500 hover:text-white"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </section>
    </aside>
  )
}
