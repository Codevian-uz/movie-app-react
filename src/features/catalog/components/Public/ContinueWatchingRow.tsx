import { Link } from '@tanstack/react-router'
import { Play } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { HomeData } from '../../types/catalog.types'

interface ContinueWatchingRowProps {
  items: HomeData['continue_watching']
  className?: string
}

export function ContinueWatchingRow({ items, className }: ContinueWatchingRowProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className={cn('space-y-6', className)}>
      <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
        <span className="mr-3 border-l-4 border-orange-500 pl-3 uppercase">Continue Watching</span>
      </h2>

      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
        {items.map((item) => {
          const progress =
            item.movie.duration_minutes !== null && item.movie.duration_minutes > 0
              ? (item.progress_seconds / (item.movie.duration_minutes * 60)) * 100
              : 0

          return (
            <div
              key={item.movie.id}
              className="group relative w-64 shrink-0 transition-all duration-300 hover:-translate-y-1"
            >
              <Link to="/watch/$movieId" params={{ movieId: item.movie.id }} className="block">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-900 shadow-md">
                  <img
                    src={item.movie.poster_url ?? '/placeholder-poster.jpg'}
                    alt={item.movie.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="rounded-full bg-orange-500 p-2 text-white">
                      <Play className="h-5 w-5 fill-current" />
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="absolute right-0 bottom-0 left-0 bg-zinc-950/60 p-2 backdrop-blur-md">
                    <Progress value={progress} className="h-1 bg-zinc-800" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="line-clamp-1 text-sm font-bold text-zinc-100 transition-colors group-hover:text-orange-500">
                    {item.movie.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {Math.floor(item.progress_seconds / 60)}m watched
                  </p>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
