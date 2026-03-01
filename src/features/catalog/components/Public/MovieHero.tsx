import { Link } from '@tanstack/react-router'
import { Play, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Movie } from '../../types/catalog.types'

interface MovieHeroProps {
  movie: Movie
}

export function MovieHero({ movie }: MovieHeroProps) {
  return (
    <div className="relative h-[90vh] w-full overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          key={movie.id}
          src={movie.backdrop_url ?? '/placeholder-backdrop.jpg'}
          alt={movie.title}
          className="animate-in fade-in animate-kenburns h-full w-full object-cover duration-1000"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container flex h-full flex-col justify-center px-6 lg:px-12">
        <div className="animate-in fade-in slide-in-from-left-12 max-w-2xl duration-1000">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
            {movie.title}
          </h1>
          <p className="mt-6 line-clamp-3 text-lg text-gray-200 drop-shadow-lg md:text-xl">
            {movie.description ?? ''}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 bg-white px-8 text-lg font-bold text-black hover:bg-white/90"
            >
              <Link to="/watch/$movieId" params={{ movieId: movie.id }}>
                <Play className="mr-2 h-6 w-6 fill-current" />
                Play
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 border-none bg-gray-500/50 px-8 text-lg font-bold text-white backdrop-blur-md hover:bg-gray-500/70"
            >
              <Info className="mr-2 h-6 w-6" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
