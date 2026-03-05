import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginResponse } from '@/features/auth'
import type { Permission } from '@/types/permissions'
import { persistStorage } from './persist-storage'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  userId: string | null
  username: string | null
  permissions: string[]
  setAuth: (tokens: LoginResponse) => void
  setUser: (userId: string, username: string) => void
  setPermissions: (permissions: string[]) => void
  clearAuth: () => void
  hasPermission: (permission: Permission) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      userId: null,
      username: null,
      permissions: [],
      setAuth: (tokens) => {
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
        })
      },
      setUser: (userId, username) => {
        set({ userId, username })
      },
      setPermissions: (permissions) => {
        set({ permissions })
      },
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          userId: null,
          username: null,
          permissions: [],
        })
      },
      hasPermission: (permission) => {
        const { permissions } = get()
        return permissions.includes('*') || permissions.includes(permission)
      },
    }),
    {
      name: 'auth-storage',
      storage: persistStorage,
    },
  ),
)
