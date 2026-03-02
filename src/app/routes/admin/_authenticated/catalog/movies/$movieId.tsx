import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { movieQueryOptions, useUpdateMovie } from '@/features/catalog'
import { MovieForm, type MovieFormValues } from '@/features/catalog/components/Movies/MovieForm'
import { useTranslation } from '@/lib/i18n'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../../-route-guards'

export const Route = createFileRoute('/admin/_authenticated/catalog/movies/$movieId')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.CATALOG_MOVIE_MANAGE)
  },
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin/catalog/movies" />,
  component: EditMoviePage,
})

function EditMoviePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { movieId } = Route.useParams()
  const updateMovie = useUpdateMovie()

  const { data: movie, isLoading } = useQuery(movieQueryOptions(movieId))

  async function onSubmit(values: MovieFormValues) {
    try {
      await updateMovie.mutateAsync({
        id: movieId,
        ...values,
        release_date:
          values.release_date !== undefined && values.release_date !== ''
            ? new Date(values.release_date).toISOString()
            : undefined,
        poster_url: values.poster_url !== '' ? values.poster_url : undefined,
        backdrop_url: values.backdrop_url !== '' ? values.backdrop_url : undefined,
        trailer_url: values.trailer_url !== '' ? values.trailer_url : undefined,
        video_url: values.video_url !== '' ? values.video_url : undefined,
        description: values.description !== '' ? values.description : undefined,
      })
      toast.success(t('catalog.movies.updated'))
      void navigate({
        to: '/admin/catalog/movies',
        search: { page: undefined, pageSize: undefined },
      })
    } catch {
      toast.error('Failed to update movie')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (movie === undefined) {
    return <div>Movie not found</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/catalog/movies" search={{ page: undefined, pageSize: undefined }}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {t('catalog.movies.editMovie')}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('catalog.movies.movieTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MovieForm
            movieId={movieId}
            defaultValues={{
              title: movie.title,
              kind: movie.kind,
              collection_id: movie.collection_id ?? '',
              collection_order: movie.collection_order ?? 0,
              description: movie.description ?? '',
              release_date: movie.release_date?.split('T')[0] ?? '',
              duration_minutes: movie.duration_minutes ?? 0,
              poster_url: movie.poster_url ?? '',
              backdrop_url: movie.backdrop_url ?? '',
              trailer_url: movie.trailer_url ?? '',
              video_url: movie.video_url ?? '',
              genre_ids: movie.genres.map((g) => g.id),
              credits: movie.credits.map((c) => ({
                person_id: c.person_id,
                role: c.role,
                character_name: c.character_name ?? '',
                display_order: c.display_order,
              })),
            }}
            onSubmit={onSubmit}
            isSubmitting={updateMovie.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
