import { apiClient } from '@/lib/api-client'
import type { ListResponse, PaginatedResponse } from '@/types/api.types'
import type {
  AuthStats,
  CreateRoleRequest,
  CreateUserRequest,
  GetRolesParams,
  GetUsersParams,
  GetUserSessionsParams,
  LoginRequest,
  LoginResponse,
  Role,
  RolePermission,
  Session,
  SetRolePermissionsRequest,
  SetUserPermissionsRequest,
  SetUserRolesRequest,
  UpdateRoleRequest,
  UpdateUserRequest,
  User,
  UserPermission,
} from '../types/auth.types'

// --- Auth ---

export async function adminLogin(req: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/v1/auth/admin-login', req)
  return response.data
}

export async function refreshToken(token: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/v1/auth/refresh-token', {
    refresh_token: token,
  })
  return response.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/v1/auth/logout')
}

export async function getAuthStats(): Promise<AuthStats> {
  const response = await apiClient.get<AuthStats>('/v1/auth/get-auth-stats')
  return response.data
}

// --- Users ---

export async function getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get<PaginatedResponse<User>>('/v1/auth/get-users', { params })
  return response.data
}

export async function createUser(req: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<User>('/v1/auth/create-user', req)
  return response.data
}

export async function updateUser(req: UpdateUserRequest): Promise<User> {
  const response = await apiClient.post<User>('/v1/auth/update-user', req)
  return response.data
}

export async function disableUser(id: string): Promise<void> {
  await apiClient.post('/v1/auth/disable-user', { id })
}

export async function enableUser(id: string): Promise<void> {
  await apiClient.post('/v1/auth/enable-user', { id })
}

// --- Sessions ---

export async function getMySessions(): Promise<Session[]> {
  const response = await apiClient.get<ListResponse<Session>>('/v1/auth/get-my-sessions')
  return response.data.content
}

export async function deleteMySession(sessionId: number): Promise<void> {
  await apiClient.post('/v1/auth/delete-my-session', { session_id: sessionId })
}

export async function getUserSessions(
  params: GetUserSessionsParams,
): Promise<PaginatedResponse<Session>> {
  const response = await apiClient.get<PaginatedResponse<Session>>('/v1/auth/get-user-sessions', {
    params,
  })
  return response.data
}

export async function deleteSession(sessionId: number): Promise<void> {
  await apiClient.post('/v1/auth/delete-session', { session_id: sessionId })
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await apiClient.post('/v1/auth/delete-user-sessions', { user_id: userId })
}

// --- Roles ---

export async function getRoles(params?: GetRolesParams): Promise<PaginatedResponse<Role>> {
  const response = await apiClient.get<PaginatedResponse<Role>>('/v1/auth/get-roles', { params })
  return response.data
}

export async function createRole(req: CreateRoleRequest): Promise<Role> {
  const response = await apiClient.post<Role>('/v1/auth/create-role', req)
  return response.data
}

export async function updateRole(req: UpdateRoleRequest): Promise<Role> {
  const response = await apiClient.post<Role>('/v1/auth/update-role', req)
  return response.data
}

export async function deleteRole(id: number): Promise<void> {
  await apiClient.post('/v1/auth/delete-role', { id })
}

export async function setRolePermissions(req: SetRolePermissionsRequest): Promise<void> {
  await apiClient.post('/v1/auth/set-role-permissions', req)
}

export async function getRolePermissions(roleId: number): Promise<RolePermission[]> {
  const response = await apiClient.get<ListResponse<RolePermission>>(
    '/v1/auth/get-role-permissions',
    {
      params: { role_id: roleId },
    },
  )
  return response.data.content
}

// --- User Access ---

export async function setUserRoles(req: SetUserRolesRequest): Promise<void> {
  await apiClient.post('/v1/auth/set-user-roles', req)
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  const response = await apiClient.get<ListResponse<Role>>('/v1/auth/get-user-roles', {
    params: { user_id: userId },
  })
  return response.data.content
}

export async function setUserPermissions(req: SetUserPermissionsRequest): Promise<void> {
  await apiClient.post('/v1/auth/set-user-permissions', req)
}

export async function getUserPermissions(userId: string): Promise<UserPermission[]> {
  const response = await apiClient.get<ListResponse<UserPermission>>(
    '/v1/auth/get-user-permissions',
    {
      params: { user_id: userId },
    },
  )
  return response.data.content
}
