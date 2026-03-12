import { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import 'videojs-contrib-quality-levels'
import 'videojs-hls-quality-selector'
import { useUpdateProgress } from '@/features/interactions'
import { useAuthStore } from '@/stores/auth.store'

// Types for plugins
interface ExtendedPlayer extends ReturnType<typeof videojs> {
  hlsQualitySelector: (options?: { displayCurrentQuality?: boolean }) => void
}

interface VideoPlayerProps {
  url: string
  poster?: string | undefined
  movieId?: string | undefined
  episodeId?: string | undefined
  initialProgress?: number | undefined
  onEnded?: () => void
}

export function VideoPlayer({
  url,
  poster,
  movieId,
  episodeId,
  initialProgress = 0,
  onEnded,
}: VideoPlayerProps) {
  const { isAuthenticated } = useAuthStore()
  const videoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<ExtendedPlayer | null>(null)
  const updateProgress = useUpdateProgress()

  useEffect(() => {
    if (videoRef.current === null) {
      return
    }

    // Determine MIME type
    const isHls = url.includes('.m3u8') || url.includes('type=hls')
    const type = isHls ? 'application/x-mpegURL' : 'video/mp4'

    // Create video element
    const videoElement = document.createElement('video-js')
    videoElement.classList.add('vjs-big-play-centered', 'vjs-cinematic')
    videoRef.current.appendChild(videoElement)

    // Initialize player
    const player = (playerRef.current = videojs(videoElement, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [{ src: url, type }],
      poster,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      userActions: {
        hotkeys: true,
      },
      html5: {
        vhs: {
          withCredentials: true,
        },
      },
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'liveDisplay',
          'remainingTimeDisplay',
          'customControlSpacer',
          'playbackRateMenuButton',
          'chaptersButton',
          'descriptionsButton',
          'subsCapsButton',
          'audioTrackButton',
          'fullscreenToggle',
        ],
      },
    }) as ExtendedPlayer)

    // Handle initial progress
    if (initialProgress > 0) {
      player.one('loadedmetadata', () => {
        player.currentTime(initialProgress)
      })
    }

    // Initialize quality selector if HLS
    if (isHls) {
      try {
        player.hlsQualitySelector({
          displayCurrentQuality: true,
        })
      } catch {
        // Ignore quality selector errors
      }
    }

    // Event listeners
    player.on('ended', () => {
      if (onEnded) {
        onEnded()
      }
    })

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isBody = document.activeElement === document.body
      const isVideo = document.activeElement?.tagName === 'VIDEO'
      const isTech = document.activeElement?.classList.contains('vjs-tech') === true

      if (!isBody && !isVideo && !isTech) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        if (player.paused()) {
          void player.play()
        } else {
          player.pause()
        }
      }

      if (e.key.toLowerCase() === 'f') {
        e.preventDefault()
        if (player.isFullscreen() === true) {
          void player.exitFullscreen()
        } else {
          void player.requestFullscreen()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      player.dispose()
      playerRef.current = null
    }
  }, [url, poster, initialProgress, onEnded])

  // Periodic progress update
  useEffect(() => {
    if (!isAuthenticated || movieId === undefined || playerRef.current === null) {
      return
    }

    const interval = setInterval(() => {
      const player = playerRef.current
      if (player !== null && !player.paused()) {
        const currentTime = Math.floor(player.currentTime() ?? 0)
        const duration = player.duration() ?? 0
        if (currentTime > 0 && duration > 0) {
          updateProgress.mutate({
            movie_id: movieId,
            episode_id: episodeId,
            progress_seconds: currentTime,
            is_finished: currentTime / duration > 0.95,
          })
        }
      }
    }, 15000)

    return () => {
      clearInterval(interval)
    }
  }, [isAuthenticated, movieId, episodeId, updateProgress])

  return (
    <div className="group hover:ring-primary/50 relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl transition-all duration-300 hover:ring-2">
      <div data-vjs-player ref={videoRef} className="h-full w-full" />

      <style>{`
        .vjs-cinematic {
          --vjs-primary: #14b8a6;
          background-color: #000;
        }
        .vjs-cinematic .vjs-big-play-button {
          background-color: rgba(20, 184, 166, 0.7);
          border: none;
          width: 80px;
          height: 80px;
          line-height: 80px;
          border-radius: 50%;
          transition: transform 0.2s, background-color 0.2s;
          left: 50%;
          top: 50%;
          margin-left: -40px;
          margin-top: -40px;
        }
        .vjs-cinematic:hover .vjs-big-play-button {
          background-color: #14b8a6;
          transform: scale(1.1);
        }
        .vjs-cinematic .vjs-control-bar {
          background-color: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(12px);
          height: 60px;
          padding: 0 10px;
        }
        .vjs-cinematic .vjs-play-progress {
          background-color: #14b8a6;
        }
        .vjs-cinematic .vjs-slider {
          background-color: rgba(255, 255, 255, 0.15);
        }
        .vjs-cinematic .vjs-load-progress div {
          background-color: rgba(255, 255, 255, 0.25);
        }
        .vjs-cinematic .vjs-volume-level {
          background-color: #14b8a6;
        }
        .vjs-menu-content {
          background-color: rgba(0, 0, 0, 0.9) !important;
          backdrop-filter: blur(10px);
          border-radius: 8px;
          margin-bottom: 10px !important;
        }
        .vjs-menu-item:hover {
          background-color: rgba(20, 184, 166, 0.5) !important;
        }
        .vjs-selected {
          background-color: #14b8a6 !important;
        }
      `}</style>
    </div>
  )
}
