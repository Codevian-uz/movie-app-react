export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  access_token_expires_at: string
  refresh_token_expires_at: string
}

export interface User {
  id: string
  username: string
  is_active: boolean
  roles: string[]
  direct_permissions: string[]
  last_active_at: string | null
  created_at: string
  updated_at: string
}

export interface Session {
  id: number
  user_id: string
  access_token_expires_at: string
  refresh_token_expires_at: string
  ip_address: string
  user_agent: string
  last_used_at: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface RolePermission {
  id: number
  role_id: number
  permission: string
  created_at: string
  updated_at: string
}

export interface UserPermission {
  id: number
  user_id: string
  permission: string
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  username: string
  password: string
}

export interface UpdateUserRequest {
  id: string
  username?: string | undefined
  password?: string | undefined
}

export interface CreateRoleRequest {
  name: string
}

export interface UpdateRoleRequest {
  id: number
  name: string
}

export interface SetRolePermissionsRequest {
  role_id: number
  permissions: string[]
}

export interface SetUserRolesRequest {
  user_id: string
  role_ids: number[]
}

export interface SetUserPermissionsRequest {
  user_id: string
  permissions: string[]
}

export interface GetUsersParams {
  id?: string | undefined
  username?: string | undefined
  is_active?: boolean | undefined
  page_number?: number | undefined
  page_size?: number | undefined
  sort?: string | undefined
}

export interface GetRolesParams {
  id?: number | undefined
  name?: string | undefined
  page_number?: number | undefined
  page_size?: number | undefined
  sort?: string | undefined
}

export interface GetUserSessionsParams {
  user_id: string
  page_number?: number | undefined
  page_size?: number | undefined
  sort?: string | undefined
}

export interface AuthStats {
  total_users: number
  active_sessions: number
}
