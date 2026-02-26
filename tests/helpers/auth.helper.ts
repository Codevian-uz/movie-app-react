import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:9876'

interface LoginResponse {
  access_token: string
  refresh_token: string
  access_token_expires_at: string
  refresh_token_expires_at: string
}

interface User {
  id: string
  username: string
  is_active: boolean
  created_at: string
}

interface UserPermission {
  permission: string
  granted_at: string
}

interface Role {
  id: number
  name: string
  created_at: string
}

interface RolePermission {
  permission: string
  granted_at: string
}

/**
 * Login via UI — navigates to /admin/login, fills form, submits, waits for redirect + permissions bootstrap.
 */
export async function loginViaUI(page: Page, username: string, password: string): Promise<void> {
  // Navigate to login page
  await page.goto('/admin/login')

  // Fill credentials
  await page.getByLabel(/username/i).fill(username)
  await page.getByLabel(/password/i).fill(password)

  // Submit login
  await page.getByRole('button', { name: /log in|sign in|kirish/i }).click()

  // Wait for redirect away from login page
  await page.waitForURL(/\/admin(?!\/login)/)

  // Wait for auth-storage to be populated with access token and permissions
  await expect(async () => {
    const ready = await page.evaluate(() => {
      const raw = localStorage.getItem('auth-storage')
      if (raw === null || raw === '') {
        return false
      }
      const parsed = JSON.parse(raw) as {
        state?: { accessToken?: unknown; permissions?: unknown[] }
      }
      return (
        parsed.state?.accessToken !== null &&
        Array.isArray(parsed.state?.permissions) &&
        parsed.state.permissions.length > 0
      )
    })
    expect(ready).toBe(true)
  }).toPass({ timeout: 15_000 })
}

/**
 * Login via API — calls backend directly, then injects tokens + permissions into localStorage.
 */
export async function loginViaAPI(page: Page, username: string, password: string): Promise<void> {
  // 1. Login to get tokens
  const loginResponse = await fetch(`${BACKEND_URL}/api/v1/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!loginResponse.ok) {
    const text = await loginResponse.text()
    throw new Error(`Login failed (${loginResponse.status.toString()}): ${text}`)
  }

  const tokens = (await loginResponse.json()) as LoginResponse

  // 2. Get user by username
  const usersResponse = await fetch(
    `${BACKEND_URL}/api/v1/auth/get-users?username=${encodeURIComponent(username)}`,
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    },
  )

  if (!usersResponse.ok) {
    const text = await usersResponse.text()
    throw new Error(`Get users failed (${usersResponse.status.toString()}): ${text}`)
  }

  const usersBody = (await usersResponse.json()) as { content: User[] }
  const users = usersBody.content
  if (users.length === 0) {
    throw new Error(`User ${username} not found`)
  }
  const user = users[0]
  if (user === undefined) {
    throw new Error(`User ${username} not found`)
  }
  const userId = user.id

  // 3. Get direct user permissions
  const userPermsResponse = await fetch(
    `${BACKEND_URL}/api/v1/auth/get-user-permissions?user_id=${encodeURIComponent(userId)}`,
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    },
  )

  if (!userPermsResponse.ok) {
    const text = await userPermsResponse.text()
    throw new Error(`Get user permissions failed (${userPermsResponse.status.toString()}): ${text}`)
  }

  const userPermsBody = (await userPermsResponse.json()) as { content: UserPermission[] }
  const userPermissions = userPermsBody.content
  const directPermissions = userPermissions.map((p) => p.permission)

  // 4. Get user roles
  const rolesResponse = await fetch(
    `${BACKEND_URL}/api/v1/auth/get-user-roles?user_id=${encodeURIComponent(userId)}`,
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    },
  )

  if (!rolesResponse.ok) {
    const text = await rolesResponse.text()
    throw new Error(`Get user roles failed (${rolesResponse.status.toString()}): ${text}`)
  }

  const rolesBody = (await rolesResponse.json()) as { content: Role[] }
  const roles = rolesBody.content

  // 5. Get permissions for each role
  const rolePermissionPromises = roles.map(async (role) => {
    const rolePermsResponse = await fetch(
      `${BACKEND_URL}/api/v1/auth/get-role-permissions?role_id=${role.id.toString()}`,
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      },
    )

    if (!rolePermsResponse.ok) {
      const text = await rolePermsResponse.text()
      throw new Error(
        `Get role permissions failed (${rolePermsResponse.status.toString()}): ${text}`,
      )
    }

    const rolePermsBody = (await rolePermsResponse.json()) as { content: RolePermission[] }
    const rolePermissions = rolePermsBody.content
    return rolePermissions.map((p) => p.permission)
  })

  const rolePermissionArrays = await Promise.all(rolePermissionPromises)
  const rolePermissions = rolePermissionArrays.flat()

  // 6. Merge and deduplicate permissions
  const allPermissions = Array.from(new Set([...directPermissions, ...rolePermissions]))

  // 7. Navigate to a page to have context
  await page.goto('/')

  // 8. Inject auth-storage into localStorage
  await page.evaluate(
    ({ accessToken, refreshToken, userId, username, permissions }) => {
      const authStorage = {
        state: {
          accessToken,
          refreshToken,
          isAuthenticated: true,
          userId,
          username,
          permissions,
        },
        version: 0,
      }
      localStorage.setItem('auth-storage', JSON.stringify(authStorage))
    },
    {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      userId,
      username,
      permissions: allPermissions,
    },
  )

  // 9. Set locale to English
  await page.evaluate(() => {
    const localeStorage = {
      state: { locale: 'en' },
      version: 0,
    }
    localStorage.setItem('locale-storage', JSON.stringify(localeStorage))
  })

  // 10. Navigate to admin panel to load with injected auth
  await page.goto('/admin')
}
