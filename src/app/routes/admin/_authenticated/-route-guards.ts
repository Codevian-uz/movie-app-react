import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'
import type { Permission } from '@/types/permissions'

export function requirePermission(permission: Permission) {
  if (!useAuthStore.getState().hasPermission(permission)) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router requires throwing redirect()
    throw redirect({ to: '/admin' })
  }
}
