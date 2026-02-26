import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslation } from '@/lib/i18n'
import type { Movie } from '../../types/catalog.types'

interface MoviesTableProps {
  movies: Movie[]
}

export function MoviesTable({ movies }: MoviesTableProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('catalog.movies.movieTitle')}</TableHead>
            <TableHead>{t('catalog.movies.releaseDate')}</TableHead>
            <TableHead>{t('catalog.movies.duration')}</TableHead>
            <TableHead>{t('catalog.movies.rating')}</TableHead>
            <TableHead className="text-right">{t('common.labels.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t('catalog.movies.noMovies')}
              </TableCell>
            </TableRow>
          ) : (
            movies.map((movie) => (
              <TableRow key={movie.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{movie.title}</span>
                    <span className="text-muted-foreground text-xs">{movie.slug}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {movie.release_date !== null && movie.release_date !== ''
                    ? format(new Date(movie.release_date), 'PP')
                    : '-'}
                </TableCell>
                <TableCell>{movie.duration_minutes ?? '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{movie.rating_average.toFixed(1)}</Badge>
                    <span className="text-muted-foreground text-xs">({movie.vote_count})</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{/* Actions will go here */}—</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
