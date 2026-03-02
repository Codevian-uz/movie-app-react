import { useEffect, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  Play,
  Maximize,
  Volume2,
  RotateCcw,
  RotateCw,
  List,
  Info,
  FastForward,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  movieQueryOptions,
  episodesQueryOptions,
  relatedAnimesQueryOptions,
  useUpdateProgress,
  continueWatchingQueryOptions,
} from '@/features/catalog'
import { MovieRow } from '@/features/catalog/components/Public/MovieRow'
import type { Episode } from '@/features/catalog/types/catalog.types'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/watch/$movieId')({
  component: WatchPage,
})

function WatchPage() {
  const { movieId } = useParams({ from: '/watch/$movieId' })
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showEpisodes, setShowEpisodes] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null)

  const { data: movie, isLoading: isMovieLoading } = useQuery(movieQueryOptions(movieId))
  const { data: episodes } = useQuery({
    ...episodesQueryOptions({ movie_id: movieId }),
    enabled: movie !== undefined,
  })
  const { data: related } = useQuery({
    ...relatedAnimesQueryOptions(movieId),
    enabled: movie !== undefined,
  })
  const { data: continueWatchingData } = useQuery({
    ...continueWatchingQueryOptions(),
    enabled: isAuthenticated && movie !== undefined,
  })

  const updateProgress = useUpdateProgress()

  // Find saved progress for this movie/series
  const savedProgressRecord = continueWatchingData?.content.find((cw) => cw.movie.id === movieId)

  // Resume playback from saved progress
  useEffect(() => {
    if (videoRef.current !== null && savedProgressRecord !== undefined && !isMovieLoading) {
      // If it's a series and we have a specific episode progress, find that episode
      if (movie?.kind === 'series' && savedProgressRecord.episode_id !== undefined) {
        const targetEp = episodes?.find((ep) => ep.id === savedProgressRecord.episode_id)
        if (targetEp !== undefined) {
          setActiveEpisode(targetEp)
        }
      }
      videoRef.current.currentTime = savedProgressRecord.progress_seconds
    }
  }, [savedProgressRecord, isMovieLoading, movie?.kind, episodes])

  // Periodic progress update
  useEffect(() => {
    if (!isAuthenticated || videoRef.current === null || !isPlaying) {
      return
    }

    const interval = setInterval(() => {
      if (videoRef.current !== null) {
        updateProgress.mutate({
          movie_id: movieId,
          episode_id: activeEpisode?.id,
          progress_seconds: Math.floor(videoRef.current.currentTime),
          is_finished: videoRef.current.currentTime / videoRef.current.duration > 0.95,
        })
      }
    }, 10000) // Update every 10 seconds

    return () => {
      clearInterval(interval)
    }
  }, [isAuthenticated, isPlaying, movieId, updateProgress, activeEpisode])

  // Auto-play first episode if it's a series and no video_url on movie
  useEffect(() => {
    if (
      movie?.video_url === null &&
      episodes !== undefined &&
      episodes.length > 0 &&
      activeEpisode === null
    ) {
      setActiveEpisode(episodes[0] ?? null)
    }
  }, [movie, episodes, activeEpisode])

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current !== null) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        void videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const skip = (amount: number) => {
    if (videoRef.current !== null) {
      videoRef.current.currentTime += amount
    }
  }

  const onTimeUpdate = () => {
    if (videoRef.current !== null) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const onLoadedMetadata = () => {
    if (videoRef.current !== null) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current !== null) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      videoRef.current.currentTime = percentage * duration
    }
  }

  const playNextEpisode = () => {
    if (episodes === undefined || activeEpisode === null) {
      return
    }
    const currentIndex = episodes.findIndex((ep) => ep.id === activeEpisode.id)
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      setActiveEpisode(episodes[currentIndex + 1] ?? null)
      if (videoRef.current !== null) {
        videoRef.current.currentTime = 0
        void videoRef.current.play()
      }
    }
  }

  if (isMovieLoading) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-red-600" />
      </div>
    )
  }

  const videoSrc =
    activeEpisode?.video_url ??
    movie?.video_url ??
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const hasNextEpisode =
    episodes !== undefined &&
    activeEpisode !== null &&
    episodes.findIndex((ep) => ep.id === activeEpisode.id) < episodes.length - 1

  const relatedMovies =
    movie !== undefined && movie.related_movies.length > 0
      ? movie.related_movies.map((m) => ({
          ...m,
          rating_average: 0,
          release_date: null,
          description: null,
          created_at: '',
          updated_at: '',
          deleted_at: null,
          collection_id: movie.collection?.id ?? null,
          trailer_url: null,
          video_url: null,
          backdrop_url: null,
        }))
      : related ?? []

  return (
    <div className="relative h-svh w-full overflow-hidden bg-black text-white">
      {/* Background/Video */}
      <video
        key={activeEpisode?.id ?? 'movie'}
        ref={videoRef}
        src={videoSrc}
        className="h-full w-full object-contain cursor-pointer"
        autoPlay
        onClick={() => {
          togglePlay()
        }}
        onPlay={() => {
          setIsPlaying(true)
        }}
        onPause={() => {
          setIsPlaying(false)
        }}
        onEnded={() => {
          if (hasNextEpisode) {
            playNextEpisode()
          } else {
            setIsPlaying(false)
          }
        }}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
      />

      {/* UI Overlay */}
      <div
        className={cn(
          'absolute inset-0 z-10 flex flex-col justify-between transition-opacity duration-500',
          showControls || !isPlaying || showDetails ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-linear-to-b from-black/90 to-transparent p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:bg-white/10 cursor-pointer"
              onClick={() => {
                void navigate({ to: '/' })
              }}
            >
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <div className="flex flex-col">
              <span className="text-sm font-light text-gray-400">
                {activeEpisode !== null
                  ? `Watching S${activeEpisode.season_number.toString()} E${activeEpisode.episode_number.toString()}`
                  : movie?.collection !== null
                    ? `Watching from ${movie?.collection?.title ?? ''}`
                    : 'Watching'}
              </span>
              <h1 className="text-xl font-bold">
                {activeEpisode?.title ?? movie?.title ?? 'Unknown Anime'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white hover:bg-white/10 cursor-pointer"
              onClick={() => {
                setShowDetails(!showDetails)
                if (!showDetails) {
                  setIsPlaying(false)
                  videoRef.current?.pause()
                }
              }}
            >
              <Info className="h-5 w-5" />
              <span>{showDetails ? 'Close Details' : 'More Info'}</span>
            </Button>
            {movie?.collection !== null && (
              <Button
                variant="outline"
                className="hidden border-white/20 bg-white/10 text-white hover:bg-white/20 md:flex cursor-pointer"
                asChild
              >
                <Link
                  to="/collections/$collectionId"
                  params={{ collectionId: movie?.collection?.id ?? '' }}
                >
                  View Franchise
                </Link>
              </Button>
            )}
            {episodes !== undefined && episodes.length > 0 && (
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white hover:bg-white/10 cursor-pointer"
                onClick={() => {
                  setShowEpisodes(!showEpisodes)
                  setShowDetails(false)
                }}
              >
                <List className="h-5 w-5" />
                <span>Episodes</span>
              </Button>
            )}
          </div>
        </div>

        {/* Center Controls (Quick Play/Pause) */}
        <div className="flex flex-1 items-center justify-center">
          {!isPlaying && !showDetails && !showEpisodes && (
            <div
              className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
              onClick={() => {
                togglePlay()
              }}
            >
              <Play className="ml-1 h-10 w-10 fill-current text-white" />
            </div>
          )}
        </div>

        {/* Details Overlay */}
        {showDetails && movie !== undefined && (
          <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md overflow-y-auto p-8 md:p-16">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/4 shrink-0 mx-auto md:mx-0">
                  <img
                    src={movie.poster_url ?? '/placeholder-poster.jpg'}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover rounded-lg shadow-2xl border border-white/10"
                  />
                </div>
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">{movie.title}</h2>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
                      <span className="text-green-500 font-bold">{movie.rating_average.toFixed(1)} Rating</span>
                      <span>{movie.release_date?.split('-')[0]}</span>
                      {movie.kind === 'movie' && <span>{movie.duration_minutes}m</span>}
                    </div>
                  </div>
                  <p className="text-lg text-gray-200 leading-relaxed">
                    {movie.description || 'No description available.'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-4">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {movie.credits.length > 0 && (
                <div className="space-y-6">
                  <h3 className="border-b border-white/10 pb-2 text-2xl font-bold">Cast & Crew</h3>
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                    {movie.credits.map((credit) => (
                      <div key={credit.id} className="space-y-2">
                        <div className="aspect-square overflow-hidden rounded-full border border-white/10 bg-white/5">
                          {credit.photo_url !== null && (
                            <img
                              src={credit.photo_url}
                              alt={credit.person_name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="line-clamp-1 text-sm font-bold">{credit.person_name}</p>
                          <p className="text-xs text-gray-400">{credit.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Episodes Sidebar */}
        {showEpisodes && episodes !== undefined && (
          <div className="absolute top-0 right-0 z-50 h-full w-80 border-l border-white/10 bg-black/95 p-6 backdrop-blur-md transition-transform">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold">Episodes</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEpisodes(false)
                }}
              >
                Close
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-80px)]">
              <div className="space-y-4 pr-4">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className={cn(
                      'group cursor-pointer rounded-lg p-3 transition-colors',
                      activeEpisode?.id === ep.id
                        ? 'border border-red-600/50 bg-red-600/20'
                        : 'hover:bg-white/10',
                    )}
                    onClick={() => {
                      setActiveEpisode(ep)
                      setShowEpisodes(false)
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="bg-muted relative aspect-video w-32 shrink-0 overflow-hidden rounded">
                        <div
                          className={cn(
                            'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity',
                            activeEpisode?.id === ep.id
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100',
                          )}
                        >
                          <Play
                            className={cn(
                              'h-6 w-6 fill-current text-white',
                              activeEpisode?.id === ep.id && 'text-red-600',
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col justify-center overflow-hidden">
                        <span className="text-xs text-gray-400">
                          E{ep.episode_number.toString()}
                        </span>
                        <h3 className="line-clamp-2 text-sm font-semibold">{ep.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="space-y-4 bg-linear-to-t from-black/90 to-transparent p-6 pb-12">
          {/* Progress Bar */}
          <div
            className="group relative h-1.5 w-full cursor-pointer bg-white/20 transition-all hover:h-2"
            onClick={handleProgressBarClick}
          >
            <div
              className="absolute top-0 bottom-0 left-0 bg-red-600"
              style={{ width: `${progressPercent.toString()}%` }}
            />
            <div
              className="absolute top-1/2 -mt-2.5 h-5 w-5 rounded-full bg-red-600 opacity-0 transition-opacity group-hover:opacity-100"
              style={{ left: `calc(${progressPercent.toString()}% - 10px)` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10 cursor-pointer"
                onClick={() => {
                  togglePlay()
                }}
              >
                {isPlaying ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="h-6 w-1.5 rounded-full bg-white" />
                    <div className="h-6 w-1.5 rounded-full bg-white" />
                  </div>
                ) : (
                  <Play className="h-8 w-8 fill-current text-white" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10 cursor-pointer"
                onClick={() => {
                  skip(-10)
                }}
              >
                <RotateCcw className="h-7 w-7" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10 cursor-pointer"
                onClick={() => {
                  skip(10)
                }}
              >
                <RotateCw className="h-7 w-7" />
              </Button>

              <div className="flex items-center gap-2 cursor-pointer group/volume">
                <Volume2 className="h-6 w-6 text-gray-400 group-hover/volume:text-white transition-colors" />
                <div className="h-1 w-24 bg-white/20">
                  <div className="h-full w-3/4 bg-white" />
                </div>
              </div>

              <div className="text-sm font-medium text-gray-300 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {hasNextEpisode && (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-white hover:bg-white/10 cursor-pointer"
                  onClick={playNextEpisode}
                >
                  <FastForward className="h-5 w-5" />
                  <span>Next Episode</span>
                </Button>
              )}
              {relatedMovies.length > 0 && (
                <div className="hidden items-center gap-2 md:flex cursor-pointer group/info">
                  <Info className="h-5 w-5 text-gray-400 group-hover/info:text-white transition-colors" />
                  <span className="text-sm font-medium text-gray-300 group-hover/info:text-white transition-colors">
                    {movie?.collection !== null ? 'Next in Franchise' : 'More Like This'}
                  </span>
                </div>
              )}
              <Maximize className="h-6 w-6 cursor-pointer text-gray-400 hover:text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Related Content Overlay (Mobile/Scrolled) */}
      {!isPlaying && relatedMovies.length > 0 && (
        <div className="absolute inset-0 z-0 bg-black/60 pt-20">
          <div className="h-full overflow-y-auto p-12">
            <MovieRow
              title={movie?.collection !== null ? 'Related in Franchise' : 'More Like This'}
              movies={relatedMovies as any}
              className="!px-0"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h > 0 ? h : null, m, s]
    .filter((v) => v !== null)
    .map((v) => v.toString().padStart(2, '0'))
    .join(':')
}
