import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/types/permissions'
import { requirePermission } from './-route-guards'

describe('requirePermission', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      userId: null,
      username: null,
      permissions: [],
    })
    localStorage.clear()
  })

  it('throws redirect when store has no matching permission', () => {
    useAuthStore.setState({ permissions: ['auth:user:read'] })

    expect(() => {
      requirePermission(PERMISSIONS.ROLE_READ)
    }).toThrow()
  })

  it('does not throw when permission is present', () => {
    useAuthStore.setState({ permissions: ['auth:user:read'] })

    expect(() => {
      requirePermission(PERMISSIONS.USER_READ)
    }).not.toThrow()
  })

  it('throws when permissions are empty', () => {
    useAuthStore.setState({ permissions: [] })

    expect(() => {
      requirePermission(PERMISSIONS.USER_READ)
    }).toThrow()
  })
})
