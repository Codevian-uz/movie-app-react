import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Play, Info, ChevronLeft, ChevronRight, Calendar, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Movie } from '../../types/catalog.types'

interface HomeSpotlightProps {
  movies: Movie[]
}

export function HomeSpotlight({ movies }: HomeSpotlightProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (movies.length === 0) {
      return
    }
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 10))
    }, 8000)
    return () => {
      clearInterval(interval)
    }
  }, [movies.length])

  if (movies.length === 0) {
    return null
  }

  const movie = movies[currentIndex]

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 10))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.min(movies.length, 10)) % Math.min(movies.length, 10))
  }

  if (!movie) {
    return null
  }

  return (
    <div className="group relative h-[70vh] w-full overflow-hidden bg-zinc-950 md:h-[85vh]">
      {/* Background Image with Ken Burns effect */}
      <div className="absolute inset-0 z-0">
        <img
          key={movie.id}
          src={movie.backdrop_url ?? movie.poster_url ?? '/placeholder-backdrop.jpg'}
          alt={movie.title}
          className="h-full w-full animate-in fade-in zoom-in-105 object-cover duration-1000"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-zinc-950/20" />
      </div>

      {/* Content */}
      <div className="container relative z-10 flex h-full flex-col justify-center px-6 lg:px-12">
        <div className="max-w-3xl animate-in fade-in slide-in-from-left-10 duration-700">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-md bg-orange-500 px-2 py-1 text-xs font-bold text-white uppercase tracking-wider">
              # {currentIndex + 1} Trending
            </span>
            <div className="flex items-center gap-1 text-sm font-medium text-orange-400">
              <Star className="h-4 w-4 fill-current" />
              <span>
                {typeof movie.rating_average === 'number'
                  ? movie.rating_average.toFixed(1)
                  : '0.0'}
              </span>
            </div>
          </div>

          <h1 className="line-clamp-2 text-4xl font-black tracking-tight text-white drop-shadow-md md:text-6xl lg:text-7xl">
            {movie.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-300 md:text-base">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span>
                {movie.release_date !== null && movie.release_date !== ''
                  ? new Date(movie.release_date).getFullYear()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-zinc-700 pl-4">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>{movie.duration_minutes ?? 0} min</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-zinc-700 pl-4 uppercase">
              <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] font-bold">
                {movie.kind}
              </span>
            </div>
          </div>

          <p className="mt-6 line-clamp-3 text-base text-zinc-400 drop-shadow-sm md:text-lg lg:max-w-2xl">
            {movie.description ?? 'No description available.'}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full bg-orange-500 px-10 text-lg font-bold text-white hover:bg-orange-600 active:scale-95 transition-all cursor-pointer shadow-lg shadow-orange-500/20"
            >
              <Link to="/watch/$movieId" params={{ movieId: movie.id }}>
                <Play className="mr-2 h-6 w-6 fill-current" />
                Watch Now
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="h-14 rounded-full border-none bg-zinc-800/80 px-10 text-lg font-bold text-white backdrop-blur-md hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
            >
              <Link to="/watch/$movieId" params={{ movieId: movie.id }}>
                <Info className="mr-2 h-6 w-6" />
                Details
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-6 bottom-12 z-20 flex gap-3 md:right-12">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 cursor-pointer rounded-full bg-zinc-900/50 text-white backdrop-blur-md hover:bg-orange-500 hover:text-white transition-all active:scale-90"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 cursor-pointer rounded-full bg-zinc-900/50 text-white backdrop-blur-md hover:bg-orange-500 hover:text-white transition-all active:scale-90"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute left-6 bottom-12 z-20 flex gap-2 md:left-12">
        {movies.slice(0, 10).map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-1.5 rounded-full transition-all cursor-pointer',
              currentIndex === index ? 'w-8 bg-orange-500' : 'w-2 bg-zinc-600 hover:bg-zinc-500',
            )}
            onClick={() => {
              setCurrentIndex(index)
            }}
          />
        ))}
      </div>
    </div>
  )
}
