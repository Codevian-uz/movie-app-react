import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Play, Maximize, Volume2, RotateCcw, RotateCw } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { movieQueryOptions } from '@/features/catalog'

export const Route = createFileRoute('/watch/$movieId')({
  component: WatchPage,
})

function WatchPage() {
  const { movieId } = useParams({ from: '/watch/$movieId' })
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showControls, setShowControls] = useState(true)

  const { data: movie, isLoading } = useQuery(movieQueryOptions(movieId))

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const skip = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-red-600" />
      </div>
    )
  }

  const videoSrc = movie?.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  return (
    <div className="relative h-svh w-full overflow-hidden bg-black text-white">
      {/* Background/Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="h-full w-full object-contain"
        autoPlay
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* UI Overlay */}
      <div
        className={`absolute inset-0 z-10 flex flex-col justify-between transition-opacity duration-500 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="flex items-center gap-4 bg-linear-to-b from-black/80 to-transparent p-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-white hover:bg-white/10"
            onClick={() => navigate({ to: '/' })}
          >
            <ArrowLeft className="h-8 w-8" />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-light text-gray-400">Watching</span>
            <h1 className="text-xl font-bold">{movie?.title || 'Unknown Anime'}</h1>
          </div>
        </div>

        {/* Center Controls (Quick Play/Pause) */}
        <div className="flex flex-1 items-center justify-center">
            {/* Can add a big play icon here on pause if needed */}
        </div>

        {/* Bottom Bar */}
        <div className="space-y-4 bg-linear-to-t from-black/80 to-transparent p-6 pb-12">
          {/* Progress Bar (Placeholder) */}
          <div className="group relative h-1 w-full bg-white/20">
            <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-red-600" />
            <div className="absolute top-1/2 -mt-1.5 left-1/3 hidden h-3 w-3 rounded-full bg-red-600 group-hover:block" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={togglePlay}>
                {isPlaying ? (
                  <Play className="h-8 w-8 fill-current text-white" /> /* Using Play with state logic below */
                ) : (
                  <Play className="h-8 w-8 fill-current text-white" />
                )}
                {/* Manual toggle for icons */}
                <Play className={`h-8 w-8 fill-current ${isPlaying ? 'hidden' : 'block'}`} />
                <div className={`h-8 w-8 ${isPlaying ? 'flex' : 'hidden'} items-center justify-center gap-1`}>
                    <div className="h-full w-2 bg-white" />
                    <div className="h-full w-2 bg-white" />
                </div>
              </Button>
              
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => skip(-10)}>
                <RotateCcw className="h-7 w-7" />
              </Button>
              
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => skip(10)}>
                <RotateCw className="h-7 w-7" />
              </Button>

              <div className="flex items-center gap-2">
                <Volume2 className="h-6 w-6" />
                <div className="h-1 w-24 bg-white/20">
                    <div className="h-full w-1/2 bg-white" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <span className="text-sm font-light text-gray-300">Next: Episode 2</span>
               <Maximize className="h-6 w-6 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
