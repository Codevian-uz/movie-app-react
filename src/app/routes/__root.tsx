import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { FileQuestion } from 'lucide-react'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/" />,
})

function RootComponent() {
  return <Outlet />
}

function NotFoundComponent() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <FileQuestion className="text-muted-foreground h-12 w-12" />
        <h1 className="text-2xl font-semibold tracking-tight">{t('notFound.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('notFound.description')}</p>
        <Button asChild>
          <Link to="/">{t('notFound.backHome')}</Link>
        </Button>
      </div>
    </div>
  )
}
