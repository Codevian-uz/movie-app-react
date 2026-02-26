import { getRolePermissions, getUserPermissions, getUserRoles, getUsers } from '../api/auth.api'

export async function bootstrapPermissions(username: string): Promise<{
  userId: string
  permissions: string[]
}> {
  try {
    const usersResponse = await getUsers({ username })
    const user = usersResponse.content[0]
    if (user === undefined) {
      return { userId: '', permissions: [] }
    }

    const directPerms = await getUserPermissions(user.id)
    const permissions = directPerms.map((p) => p.permission)

    const roles = await getUserRoles(user.id)
    const rolePerms = await Promise.all(roles.map(async (role) => getRolePermissions(role.id)))
    permissions.push(...rolePerms.flat().map((p) => p.permission))

    return { userId: user.id, permissions: [...new Set(permissions)] }
  } catch {
    return { userId: '', permissions: [] }
  }
}
