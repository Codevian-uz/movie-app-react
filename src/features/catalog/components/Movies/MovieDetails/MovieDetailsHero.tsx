import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Play, Info, Calendar, Clock, Star, Heart, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { TitleDetailsResponse } from '@/features/catalog/types/catalog.types'
import {
  useToggleFavorite,
  useToggleLike,
  statusQueryOptions,
  statsQueryOptions,
} from '@/features/interactions'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

interface Props {
  movie: TitleDetailsResponse['movie']
  genres: TitleDetailsResponse['genres']
}

export function MovieDetailsHero({ movie, genres }: Props) {
  const { isAuthenticated } = useAuthStore()
  const toggleLike = useToggleLike()
  const toggleFavorite = useToggleFavorite()

  const { data: status } = useQuery({
    ...statusQueryOptions({ target_type: 'movie', target_id: movie.id }),
    enabled: isAuthenticated,
  })

  const { data: stats } = useQuery({
    ...statsQueryOptions({ target_type: 'movie', target_id: movie.id }),
  })

  const isFavorited = status?.is_favorited ?? false
  const isLiked = status?.is_liked ?? false
  const likesCount = stats?.likes_count ?? 0

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like this movie')
      return
    }
    try {
      const res = await toggleLike.mutateAsync({
        target_type: 'movie',
        target_id: movie.id,
      })
      toast.success(res.liked ? 'Added to liked' : 'Removed from liked')
    } catch {
      toast.error('Failed to toggle like')
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to your list')
      return
    }
    try {
      const res = await toggleFavorite.mutateAsync({
        target_type: 'movie',
        target_id: movie.id,
      })
      toast.success(res.favorited ? 'Added to My List' : 'Removed from My List')
    } catch {
      toast.error('Failed to toggle favorite')
    }
  }

  return (
    <div className="relative flex h-[60vh] min-h-125 w-full items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdrop_url ?? movie.poster_url ?? '/placeholder-backdrop.jpg'}
          alt={movie.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
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

          <div className="flex flex-wrap items-center gap-4 pt-4">
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

            <Button
              size="icon"
              variant="secondary"
              className={cn(
                'h-12 w-auto cursor-pointer rounded-full bg-white/10 px-4 text-white backdrop-blur-md hover:bg-white/20',
                isLiked && 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30',
              )}
              onClick={() => {
                void handleToggleLike()
              }}
              disabled={toggleLike.isPending}
            >
              <Heart className={cn('mr-2 h-6 w-6', isLiked && 'fill-current')} />
              <span className="font-bold">{likesCount > 0 ? likesCount : 'Like'}</span>
            </Button>

            <Button
              size="icon"
              variant="secondary"
              className={cn(
                'h-12 w-12 cursor-pointer rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20',
                isFavorited && 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30',
              )}
              onClick={() => {
                void handleToggleFavorite()
              }}
              disabled={toggleFavorite.isPending}
            >
              {isFavorited ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
