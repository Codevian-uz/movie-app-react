import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Check, Play, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { myListQueryOptions, useToggleFavorite } from '../../api/catalog.queries'
import type { Movie } from '../../types/catalog.types'

interface MovieCardProps {
  movie: Movie
  progress?: number | undefined
  className?: string
}

export function MovieCard({ movie, progress, className }: MovieCardProps) {
  const { isAuthenticated } = useAuthStore()
  const toggleFavorite = useToggleFavorite()

  const { data: myListData } = useQuery({
    ...myListQueryOptions(),
    enabled: isAuthenticated,
  })

  const isFavorite = (myListData?.content ?? []).some((m) => m.id === movie.id)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      return
    }
    toggleFavorite.mutate({ movie_id: movie.id })
  }

  return (
    <Link
      to="/watch/$movieId"
      params={{ movieId: movie.id }}
      className={cn(
        'group bg-muted relative aspect-2/3 w-full cursor-pointer overflow-hidden rounded-md transition-all duration-300 hover:z-50 hover:scale-105 hover:shadow-2xl',
        className,
      )}
    >
      <img
        src={movie.poster_url ?? '/placeholder-poster.jpg'}
        alt={movie.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${Math.min(100, progress).toString()}%` }}
          />
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end bg-linear-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="line-clamp-1 text-sm font-bold text-white md:text-base">{movie.title}</h3>
          {movie.kind === 'series' && (
            <Badge className="h-3.5 border-none bg-red-600 px-1 text-[8px] font-black tracking-tighter text-white uppercase">
              Series
            </Badge>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/80">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </div>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white transition-colors hover:bg-white/20 cursor-pointer"
              onClick={handleToggleFavorite}
              disabled={toggleFavorite.isPending}
            >
              {isFavorite ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-300">
          {movie.rating_average > 0 && (
            <span className="font-semibold text-green-500">
              {movie.rating_average.toFixed(1)} Rating
            </span>
          )}
          <span>
            {movie.kind === 'movie' && typeof movie.duration_minutes === 'number'
              ? `${movie.duration_minutes.toString()}m`
              : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
