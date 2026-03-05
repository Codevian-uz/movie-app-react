import { useEffect, useState, useRef, memo } from 'react'
import { Play, RotateCcw, RotateCw, Volume2, Maximize, FastForward, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpdateProgress } from '@/features/interactions'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

interface VideoPlayerProps {
  movieId: string
  videoUrl: string | null
  title: string
  episodeId?: string | undefined
  initialProgress?: number | undefined
  onEnded?: () => void
  hasNextEpisode?: boolean
  playNextEpisode?: () => void
  autoplay?: boolean | undefined
}

export const VideoPlayer = memo(function VideoPlayer({
  movieId,
  videoUrl,
  title,
  episodeId,
  initialProgress = 0,
  onEnded,
  hasNextEpisode,
  playNextEpisode,
  autoplay = false,
}: VideoPlayerProps) {
  const { isAuthenticated } = useAuthStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const updateProgress = useUpdateProgress()

  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)

  // Use effective video source or placeholder
  const videoSrc =
    videoUrl ?? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  // Handle resume progress
  useEffect(() => {
    if (videoRef.current !== null && initialProgress > 0) {
      videoRef.current.currentTime = initialProgress
    }
  }, [initialProgress, videoSrc])

  // Periodic progress update
  useEffect(() => {
    if (!isAuthenticated || videoRef.current === null || !isPlaying) {
      return
    }

    const interval = setInterval(() => {
      if (videoRef.current !== null && videoRef.current.duration > 0) {
        updateProgress.mutate({
          movie_id: movieId,
          episode_id: episodeId,
          progress_seconds: Math.floor(videoRef.current.currentTime),
          is_finished: videoRef.current.currentTime / videoRef.current.duration > 0.95,
        })
      }
    }, 15000) // Update every 15 seconds

    return () => {
      clearInterval(interval)
    }
  }, [isAuthenticated, isPlaying, movieId, episodeId, updateProgress])

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleInteraction = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const container = videoRef.current?.parentElement
    if (container) {
      container.addEventListener('mousemove', handleInteraction)
      container.addEventListener('touchstart', handleInteraction)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleInteraction)
        container.removeEventListener('touchstart', handleInteraction)
      }
      clearTimeout(timeout)
    }
  }, [isPlaying])

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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return [h > 0 ? h : null, m, s]
      .filter((v) => v !== null)
      .map((v) => v.toString().padStart(2, '0'))
      .join(':')
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl transition-all duration-500">
      <video
        ref={videoRef}
        src={videoSrc}
        className="h-full w-full object-contain"
        autoPlay={autoplay}
        onPlay={() => {
          setIsPlaying(true)
        }}
        onPause={() => {
          setIsPlaying(false)
        }}
        onEnded={() => {
          setIsPlaying(false)
          if (onEnded) {
            onEnded()
          }
        }}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration)
          }
        }}
        onClick={() => {
          togglePlay()
        }}
      />

      {/* UI Overlay */}
      <div
        className={cn(
          'absolute inset-0 z-10 flex flex-col justify-end bg-linear-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0',
        )}
      >
        {/* Progress Bar */}
        <div
          className="px-4 pb-2"
          onClick={(e) => {
            if (videoRef.current) {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const percentage = x / rect.width
              videoRef.current.currentTime = percentage * duration
            }
          }}
        >
          <div className="group/progress relative h-1.5 w-full cursor-pointer bg-white/20 transition-all hover:h-2">
            <div
              className="absolute h-full bg-orange-500"
              style={{ width: `${progressPercent.toString()}%` }}
            />
            <div
              className="absolute top-1/2 -mt-2 h-4 w-4 rounded-full bg-orange-500 opacity-0 transition-opacity group-hover/progress:opacity-100"
              style={{ left: `calc(${progressPercent.toString()}% - 8px)` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 pt-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:bg-white/10"
              onClick={() => {
                togglePlay()
              }}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="h-6 w-6 fill-current" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={() => {
                skip(-10)
              }}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={() => {
                skip(10)
              }}
            >
              <RotateCw className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 px-2">
              <Volume2 className="h-5 w-5 text-gray-400" />
              <div className="h-1 w-16 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-3/4 bg-white" />
              </div>
            </div>

            <div className="text-xs font-medium text-gray-300 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden max-w-[200px] truncate text-sm font-bold text-white/80 sm:inline-block">
              {title}
            </span>
            {hasNextEpisode === true && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-white hover:bg-white/10"
                onClick={() => {
                  if (playNextEpisode) {
                    playNextEpisode()
                  }
                }}
              >
                <FastForward className="h-4 w-4 fill-current" />
                <span className="xs:inline hidden">Next</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={() => {
                if (videoRef.current) {
                  if (document.fullscreenElement) {
                    void document.exitFullscreen()
                  } else {
                    void videoRef.current.parentElement?.requestFullscreen()
                  }
                }
              }}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Large Center Play Button when paused */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40"
          onClick={() => {
            togglePlay()
          }}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/80 text-white backdrop-blur-sm transition-transform hover:scale-110">
            <Play className="ml-1 h-10 w-10 fill-current" />
          </div>
        </div>
      )}
    </div>
  )
})
