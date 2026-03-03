import { Link } from '@tanstack/react-router'
import { ChevronRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Movie } from '../../types/catalog.types'

interface HomeSectionProps {
  title: string
  movies: Movie[]
  viewAllLink?: string | undefined
  className?: string | undefined
}

export function HomeSection({ title, movies, viewAllLink, className }: HomeSectionProps) {
  if (movies.length === 0) {
    return null
  }

  return (
    <section className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
          <span className="mr-3 border-l-4 border-orange-500 pl-3">{title}</span>
        </h2>
        {viewAllLink !== undefined && viewAllLink !== '' && (
          <Button
            asChild
            variant="ghost"
            className="group h-auto p-0 text-sm font-medium text-zinc-400 hover:bg-transparent hover:text-orange-500"
          >
            <Link to={viewAllLink}>
              View All
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <div key={movie.id} className="group relative">
            <Link to="/movies/$movieId" params={{ movieId: movie.id }} className="block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-orange-500/10">
                <img
                  src={movie.poster_url ?? '/placeholder-poster.jpg'}
                  alt={movie.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="rounded-full bg-orange-500 p-3 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-6 w-6 fill-current" />
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {movie.rating_average >= 8 && (
                    <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      Hot
                    </span>
                  )}
                  <span className="rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-md">
                    {movie.kind}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <h3 className="line-clamp-1 text-sm font-bold text-zinc-100 transition-colors group-hover:text-orange-500 md:text-base">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>
                    {movie.release_date !== null && movie.release_date !== ''
                      ? new Date(movie.release_date).getFullYear()
                      : 'N/A'}
                  </span>
                  <span>•</span>
                  <span>{movie.duration_minutes}m</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
