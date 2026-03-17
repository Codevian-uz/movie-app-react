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
    <div className="relative w-full overflow-hidden">
      {/* Immersive Backdrop */}
      <div className="absolute inset-0 z-0 h-[80vh] min-h-[600px]">
        <img
          src={movie.backdrop_url ?? movie.poster_url ?? '/placeholder-backdrop.jpg'}
          alt={movie.title}
          className="h-full w-full object-cover object-top opacity-60 transition-transform duration-10000 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-16 md:px-12 lg:pt-48">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
          {/* Poster - Hidden on small mobile, visible on larger */}
          <div className="hidden w-64 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-orange-500/5 lg:block">
            <img
              src={movie.poster_url ?? '/placeholder-poster.jpg'}
              alt={movie.title}
              className="aspect-2/3 w-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {movie.kind === 'series' && (
                  <span className="rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg shadow-orange-500/20">
                    Series
                  </span>
                )}
                {movie.status === 'airing' && (
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg shadow-emerald-500/20">
                    Airing
                  </span>
                )}
                <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-3 py-1 text-sm font-bold text-orange-500 ring-1 ring-white/10 backdrop-blur-md">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{movie.rating_average > 0 ? movie.rating_average.toFixed(1) : 'NR'}</span>
                </div>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl xl:text-8xl">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-zinc-400">
                {movie.release_date !== null && (
                  <span className="flex items-center gap-1.5 text-zinc-100">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    {movie.release_date.split('-')[0]}
                  </span>
                )}
                {movie.duration_minutes !== null && movie.kind === 'movie' && (
                  <span className="flex items-center gap-1.5 text-zinc-100">
                    <Clock className="h-4 w-4 text-orange-500" />
                    {movie.duration_minutes}m
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {genres.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-xs text-zinc-300 transition-colors hover:bg-white/10"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="max-w-3xl text-lg leading-relaxed text-zinc-300 md:text-xl lg:line-clamp-3">
              {movie.description ??
                'Prepare for an unforgettable journey through a world of mystery and wonder.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button
                size="lg"
                className="group relative h-14 overflow-hidden bg-orange-500 px-10 text-lg font-bold text-white transition-all hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-95"
                asChild
              >
                <Link to="/watch/$movieId" params={{ movieId: movie.id }}>
                  <Play className="mr-2 h-6 w-6 fill-current transition-transform group-hover:scale-110" />
                  Play Now
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </Link>
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    'h-14 min-w-[120px] border-white/10 bg-zinc-900/50 text-white backdrop-blur-xl transition-all hover:bg-zinc-800 hover:text-orange-500 active:scale-95',
                    isLiked && 'border-orange-500/50 bg-orange-500/10 text-orange-500',
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
                  variant="outline"
                  className={cn(
                    'h-14 w-14 border-white/10 bg-zinc-900/50 text-white backdrop-blur-xl transition-all hover:bg-zinc-800 hover:text-orange-500 active:scale-95',
                    isFavorited && 'border-orange-500/50 bg-orange-500/10 text-orange-500',
                  )}
                  onClick={() => {
                    void handleToggleFavorite()
                  }}
                  disabled={toggleFavorite.isPending}
                >
                  {isFavorited ? (
                    <Check className="h-7 w-7 stroke-[2.5px]" />
                  ) : (
                    <Plus className="h-7 w-7 stroke-[2.5px]" />
                  )}
                </Button>
              </div>

              {movie.trailer_url !== null && (
                <Button
                  variant="ghost"
                  className="h-14 gap-2 text-zinc-400 hover:bg-transparent hover:text-white"
                  asChild
                >
                  <Link
                    to="/movies/$movieId"
                    params={{ movieId: movie.id }}
                    search={(prev) => ({ ...prev, isTrailer: true })}
                  >
                    <Info className="h-5 w-5" />
                    Watch Trailer
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
