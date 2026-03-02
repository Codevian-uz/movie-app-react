import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  onDelete?: ((id: string) => void) | undefined
}

export function MoviesTable({ movies, onDelete }: MoviesTableProps) {
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
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span>{movie.title}</span>
                      <Badge
                        variant={movie.kind === 'series' ? 'default' : 'outline'}
                        className="h-4 px-1 text-[10px] uppercase"
                      >
                        {movie.kind}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-xs">{movie.slug}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {movie.release_date !== null && movie.release_date !== ''
                    ? format(new Date(movie.release_date), 'PP')
                    : '-'}
                </TableCell>
                <TableCell>
                  {movie.kind === 'movie' ? (movie.duration_minutes ?? '-') : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{movie.rating_average.toFixed(1)}</Badge>
                    <span className="text-muted-foreground text-xs">({movie.vote_count})</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin/catalog/movies/$movieId"
                          params={{ movieId: movie.id }}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 size-4" />
                          {t('common.actions.edit')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete?.(movie.id)}
                        className="text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 size-4" />
                        {t('common.actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
