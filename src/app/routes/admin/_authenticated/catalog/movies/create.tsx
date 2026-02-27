import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateMovie } from '@/features/catalog'
import { MovieForm, type MovieFormValues } from '@/features/catalog/components/Movies/MovieForm'
import { useTranslation } from '@/lib/i18n'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from '../../-route-guards'

export const Route = createFileRoute('/admin/_authenticated/catalog/movies/create')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.CATALOG_MOVIE_MANAGE)
  },
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin/catalog/movies" />,
  component: CreateMoviePage,
})

function CreateMoviePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMovie = useCreateMovie()

  async function onSubmit(values: MovieFormValues) {
    try {
      await createMovie.mutateAsync({
        ...values,
        release_date:
          values.release_date !== undefined && values.release_date !== ''
            ? new Date(values.release_date).toISOString()
            : undefined,
        poster_url: values.poster_url !== '' ? values.poster_url : undefined,
        backdrop_url: values.backdrop_url !== '' ? values.backdrop_url : undefined,
        // Map video_url to trailer_url for the backend if video_url is provided,
        // otherwise use the trailer_url. This is because the backend currently
        // only has a trailer_url field for video content.
        trailer_url: (values.video_url !== '' ? values.video_url : values.trailer_url) || undefined,
        description: values.description !== '' ? values.description : undefined,
      })
      toast.success(t('catalog.movies.created'))
      void navigate({
        to: '/admin/catalog/movies',
        search: { page: undefined, pageSize: undefined },
      })
    } catch {
      toast.error('Failed to create movie')
    }
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
          {t('catalog.movies.createMovie')}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('catalog.movies.movieTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MovieForm onSubmit={onSubmit} isSubmitting={createMovie.isPending} />
        </CardContent>
      </Card>
    </div>
  )
}
