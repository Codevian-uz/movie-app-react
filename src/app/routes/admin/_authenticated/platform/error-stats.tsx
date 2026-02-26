import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_authenticated/platform/error-stats')({
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router requires throwing redirect()
    throw redirect({ to: '/admin/platform/errors' })
  },
})
