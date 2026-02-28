import { Play, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import type { Movie } from '../../types/catalog.types'

interface MovieCardProps {
  movie: Movie
  className?: string
}

export function MovieCard({ movie, className }: MovieCardProps) {
  return (
    <Link
      to="/watch/$movieId"
      params={{ movieId: movie.id }}
      className={cn(
        'group relative aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-md bg-muted transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:z-50',
        className
      )}
    >
      <img
        src={movie.poster_url || '/placeholder-poster.jpg'}
        alt={movie.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end bg-linear-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="text-sm font-bold text-white md:text-base">{movie.title}</h3>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/80">
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white transition-colors hover:bg-white/20">
            <Plus className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-300">
          {movie.rating_average > 0 && (
            <span className="font-semibold text-green-500">{movie.rating_average.toFixed(1)} Rating</span>
          )}
          <span>{movie.duration_minutes}m</span>
        </div>
      </div>
    </Link>
  )
}
