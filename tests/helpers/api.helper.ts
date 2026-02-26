/**
 * API helpers for E2E test setup.
 *
 * Direct backend API access for bootstrapping test data.
 * Uses fetch() to call the Go backend at localhost:9876.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8081'

/**
 * POST request helper with optional auth token.
 */
async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`POST ${path} failed (${response.status.toString()}): ${text}`)
  }

  return (await response.json()) as T
}

async function apiGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GET ${path} failed (${response.status.toString()}): ${text}`)
  }

  return (await response.json()) as T
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  access_token_expires_at: string
  refresh_token_expires_at: string
}

/**
 * Login as superadmin and return access token.
 */
export async function superadminLogin(): Promise<string> {
  const response = await apiPost<LoginResponse>('/api/v1/auth/admin-login', {
    username: 'superadmin',
    password: 'superadmin123',
  })
  return response.access_token
}

interface CreateUserResponse {
  id: string
  username: string
  is_active: boolean
  created_at: string
}

/**
 * Create a new user, or return the existing one on 409 conflict.
 */
export async function createUser(
  token: string,
  req: { username: string; password: string },
): Promise<{ id: string }> {
  try {
    const response = await apiPost<CreateUserResponse>('/api/v1/auth/create-user', req, token)
    return { id: response.id }
  } catch (error) {
    if (error instanceof Error && error.message.includes('409')) {
      const usersResponse = await apiGet<{ content: { id: string }[] }>(
        `/api/v1/auth/get-users?username=${encodeURIComponent(req.username)}`,
        token,
      )
      const users = usersResponse.content
      if (users.length === 0) {
        throw new Error(`User ${req.username} conflict but not found`)
      }
      const user = users[0]
      if (!user) {
        throw new Error('Unexpected: user not found after length check')
      }
      return { id: user.id }
    }
    throw error
  }
}

interface CreateRoleResponse {
  id: number
  name: string
  created_at: string
}

/**
 * Create a new role, or return the existing one on 409 conflict.
 */
export async function createRole(token: string, req: { name: string }): Promise<{ id: number }> {
  try {
    const response = await apiPost<CreateRoleResponse>('/api/v1/auth/create-role', req, token)
    return { id: response.id }
  } catch (error) {
    if (error instanceof Error && error.message.includes('409')) {
      const rolesResponse = await apiGet<{ content: { id: number }[] }>(
        `/api/v1/auth/get-roles?name=${encodeURIComponent(req.name)}`,
        token,
      )
      const roles = rolesResponse.content
      if (roles.length === 0) {
        throw new Error(`Role ${req.name} conflict but not found`)
      }
      const role = roles[0]
      if (!role) {
        throw new Error('Unexpected: role not found after length check')
      }
      return { id: role.id }
    }
    throw error
  }
}

/**
 * Set permissions for a role.
 */
export async function setRolePermissions(
  token: string,
  roleId: number,
  permissions: string[],
): Promise<void> {
  await apiPost('/api/v1/auth/set-role-permissions', { role_id: roleId, permissions }, token)
}

/**
 * Assign roles to a user.
 */
export async function setUserRoles(
  token: string,
  userId: string,
  roleIds: number[],
): Promise<void> {
  await apiPost('/api/v1/auth/set-user-roles', { user_id: userId, role_ids: roleIds }, token)
}

/**
 * Create a user with a dedicated role containing the specified permissions.
 *
 * @returns userId and roleId
 */
export async function bootstrapUserWithPermissions(
  token: string,
  username: string,
  password: string,
  permissions: string[],
): Promise<{ userId: string; roleId: number }> {
  // Create user
  const { id: userId } = await createUser(token, { username, password })

  // Create role
  const { id: roleId } = await createRole(token, { name: `${username}-role` })

  // Assign permissions to role
  await setRolePermissions(token, roleId, permissions)

  // Assign role to user
  await setUserRoles(token, userId, [roleId])

  return { userId, roleId }
}
