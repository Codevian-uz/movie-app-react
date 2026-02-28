import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Movie } from '../../types/catalog.types'
import { MovieCard } from './MovieCard'

interface MovieRowProps {
  title: string
  movies: Movie[]
  className?: string
}

export function MovieRow({ title, movies, className }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [isMoved, setIsMoved] = useState(false)

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true)
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  if (movies.length === 0) return null

  return (
    <div className={cn('space-y-2 md:space-y-4 px-6 lg:px-12', className)}>
      <h2 className="text-lg font-semibold text-white/90 transition-colors hover:text-white md:text-2xl">
        {title}
      </h2>
      <div className="group relative">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-0 bottom-0 left-0 z-40 m-auto h-full w-12 cursor-pointer bg-black/50 opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100',
            !isMoved && 'hidden'
          )}
          onClick={() => handleClick('left')}
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </Button>

        <div
          ref={rowRef}
          className="flex items-center gap-2 overflow-x-scroll scrollbar-hide md:gap-4"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} className="min-w-[140px] md:min-w-[200px]" />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 bottom-0 right-0 z-40 m-auto h-full w-12 cursor-pointer bg-black/50 opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
          onClick={() => handleClick('right')}
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </Button>
      </div>
    </div>
  )
}
