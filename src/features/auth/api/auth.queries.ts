import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import type {
  GetRolesParams,
  GetUsersParams,
  GetUserSessionsParams,
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  RegisterResponse,
} from '../types/auth.types'
import { bootstrapPermissions } from '../utils/bootstrap-permissions'
import {
  adminLogin,
  userLogin,
  register,
  createRole,
  createUser,
  deleteMySession,
  deleteRole,
  deleteSession,
  deleteUserSessions,
  disableUser,
  enableUser,
  getAuthStats,
  getMySessions,
  getRolePermissions,
  getRoles,
  getUserPermissions,
  getUserRoles,
  getUsers,
  getUserSessions,
  logout,
  setRolePermissions,
  setUserPermissions,
  setUserRoles,
  updateRole,
  updateUser,
} from './auth.api'

// --- Query Keys ---

export const authKeys = {
  users: (params?: GetUsersParams) => ['auth', 'users', params] as const,
  roles: (params?: GetRolesParams) => ['auth', 'roles', params] as const,
  rolePermissions: (roleId: number) => ['auth', 'role-permissions', roleId] as const,
  userRoles: (userId: string) => ['auth', 'user-roles', userId] as const,
  userPermissions: (userId: string) => ['auth', 'user-permissions', userId] as const,
  mySessions: () => ['auth', 'my-sessions'] as const,
  userSessions: (params: GetUserSessionsParams) => ['auth', 'user-sessions', params] as const,
  authStats: () => ['auth', 'stats'] as const,
}

export class AuthBootstrapError extends Error {
  constructor() {
    super('AUTH_BOOTSTRAP_FAILED')
    this.name = 'AuthBootstrapError'
  }
}

// --- Query Options ---

export function usersQueryOptions(params?: GetUsersParams) {
  return queryOptions({
    queryKey: authKeys.users(params),
    queryFn: () => getUsers(params),
  })
}

export function rolesQueryOptions(params?: GetRolesParams) {
  return queryOptions({
    queryKey: authKeys.roles(params),
    queryFn: () => getRoles(params),
  })
}

export function rolePermissionsQueryOptions(roleId: number) {
  return queryOptions({
    queryKey: authKeys.rolePermissions(roleId),
    queryFn: () => getRolePermissions(roleId),
  })
}

export function userRolesQueryOptions(userId: string) {
  return queryOptions({
    queryKey: authKeys.userRoles(userId),
    queryFn: () => getUserRoles(userId),
  })
}

export function userPermissionsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: authKeys.userPermissions(userId),
    queryFn: () => getUserPermissions(userId),
  })
}

export function mySessionsQueryOptions() {
  return queryOptions({
    queryKey: authKeys.mySessions(),
    queryFn: getMySessions,
  })
}

export function userSessionsQueryOptions(params: GetUserSessionsParams) {
  return queryOptions({
    queryKey: authKeys.userSessions(params),
    queryFn: () => getUserSessions(params),
  })
}

export function authStatsQueryOptions() {
  return queryOptions({
    queryKey: authKeys.authStats(),
    queryFn: getAuthStats,
  })
}

// --- Mutations ---

export function useAdminLogin() {
  return useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: async (variables: LoginRequest) => {
      const data = await adminLogin(variables)
      useAuthStore.getState().setAuth(data)

      const bootstrapped = await bootstrapPermissions(variables.username)
      if (bootstrapped.userId === '') {
        useAuthStore.getState().clearAuth()
        throw new AuthBootstrapError()
      }

      useAuthStore.getState().setUser(bootstrapped.userId, variables.username)
      useAuthStore.getState().setPermissions(bootstrapped.permissions)
      return data
    },
  })
}

export function useUserLogin() {
  return useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: async (variables: LoginRequest) => {
      const data = await userLogin(variables)
      useAuthStore.getState().setAuth(data)
      useAuthStore.getState().setUser(variables.username, variables.username)
      return data
    },
  })
}

export function useRegister() {
  return useMutation<RegisterResponse, unknown, CreateUserRequest>({
    mutationFn: register,
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      useAuthStore.getState().clearAuth()
      queryClient.clear()
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'users'] })
    },
  })
}

export function useDisableUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: disableUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'users'] })
    },
  })
}

export function useEnableUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: enableUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'users'] })
    },
  })
}

export function useDeleteMySession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMySession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.mySessions() })
    },
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'user-sessions'] })
    },
  })
}

export function useDeleteUserSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUserSessions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'user-sessions'] })
    },
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'roles'] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'roles'] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'roles'] })
    },
  })
}

export function useSetRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setRolePermissions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'role-permissions'] })
    },
  })
}

export function useSetUserRoles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setUserRoles,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'user-roles'] })
    },
  })
}

export function useSetUserPermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setUserPermissions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'user-permissions'] })
    },
  })
}
