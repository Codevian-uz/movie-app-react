import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './auth.store'

describe('auth store', () => {
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

  it('defaults to unauthenticated', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.userId).toBeNull()
    expect(state.username).toBeNull()
    expect(state.permissions).toEqual([])
  })

  it('sets auth tokens on setAuth', () => {
    useAuthStore.getState().setAuth({
      access_token: 'test-access',
      refresh_token: 'test-refresh',
      access_token_expires_at: '2099-01-01T00:00:00Z',
      refresh_token_expires_at: '2099-01-01T00:00:00Z',
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe('test-access')
    expect(state.refreshToken).toBe('test-refresh')
  })

  it('sets user info on setUser', () => {
    useAuthStore.getState().setUser('user-123', 'admin')

    const state = useAuthStore.getState()
    expect(state.userId).toBe('user-123')
    expect(state.username).toBe('admin')
  })

  it('sets permissions on setPermissions', () => {
    useAuthStore.getState().setPermissions(['auth:user:read', 'auth:role:read'])

    const state = useAuthStore.getState()
    expect(state.permissions).toEqual(['auth:user:read', 'auth:role:read'])
  })

  it('clears auth on clearAuth', () => {
    useAuthStore.getState().setAuth({
      access_token: 'test-access',
      refresh_token: 'test-refresh',
      access_token_expires_at: '2099-01-01T00:00:00Z',
      refresh_token_expires_at: '2099-01-01T00:00:00Z',
    })
    useAuthStore.getState().setUser('user-123', 'admin')
    useAuthStore.getState().setPermissions(['auth:user:read'])

    useAuthStore.getState().clearAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.userId).toBeNull()
    expect(state.username).toBeNull()
    expect(state.permissions).toEqual([])
  })

  it('hasPermission returns true for matching permission', () => {
    useAuthStore.getState().setPermissions(['auth:user:read', 'auth:role:read'])

    expect(useAuthStore.getState().hasPermission('auth:user:read')).toBe(true)
    expect(useAuthStore.getState().hasPermission('auth:role:read')).toBe(true)
    expect(useAuthStore.getState().hasPermission('auth:user:manage')).toBe(false)
  })
})
