import { Link } from '@tanstack/react-router'
import { Play, Info, Calendar, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TitleDetailsResponse } from '@/features/catalog/types/catalog.types'

interface Props {
  movie: TitleDetailsResponse['movie']
  genres: TitleDetailsResponse['genres']
}

export function MovieDetailsHero({ movie, genres }: Props) {
  return (
    <div className="relative flex h-[60vh] min-h-[500px] w-full items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdrop_url ?? movie.poster_url ?? '/placeholder-backdrop.jpg'}
          alt={movie.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex items-center px-6 md:px-12">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            {movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
            {movie.rating_average > 0 && (
              <div className="flex items-center gap-1 font-bold text-green-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{movie.rating_average.toFixed(1)}</span>
              </div>
            )}
            {movie.release_date !== null && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{movie.release_date.split('-')[0]}</span>
              </div>
            )}
            {movie.duration_minutes !== null && movie.kind === 'movie' && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{movie.duration_minutes}m</span>
              </div>
            )}
            <div className="ml-2 flex items-center gap-2 border-l border-white/20 pl-4">
              {genres.slice(0, 3).map((g) => (
                <span key={g.id}>{g.name}</span>
              ))}
            </div>
          </div>

          <p className="line-clamp-4 text-lg leading-relaxed text-gray-200">
            {movie.description ?? 'No description available.'}
          </p>

          <div className="flex items-center gap-4 pt-4">
            <Button size="lg" className="cursor-pointer gap-2 px-8" asChild>
              <Link to="/watch/$movieId" params={{ movieId: movie.id }}>
                <Play className="h-5 w-5 fill-current" />
                Play Now
              </Link>
            </Button>
            {movie.trailer_url !== null && (
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer gap-2 border-white/20 bg-black/50 text-white hover:bg-white/10"
                asChild
              >
                <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer">
                  <Info className="h-5 w-5" />
                  Trailer
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
