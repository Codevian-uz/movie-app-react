import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/admin/_authenticated')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router requires throwing redirect()
      throw redirect({ to: '/admin/login' })
    }
  },
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
