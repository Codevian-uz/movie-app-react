import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/admin/_authenticated')({
  beforeLoad: () => {
    const auth = useAuthStore.getState()
    if (!auth.isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router requires throwing redirect()
      throw redirect({ to: '/admin/login' })
    }

    // Check if user has ANY administrative permission.
    // If they have none, they shouldn't be in the admin panel at all.
    if (auth.permissions.length === 0) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/' })
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
