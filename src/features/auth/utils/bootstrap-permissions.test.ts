import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PaginatedResponse } from '@/types/api.types'
import type { Role, RolePermission, User, UserPermission } from '../types/auth.types'
import { bootstrapPermissions } from './bootstrap-permissions'

vi.mock('../api/auth.api')

const { getUsers, getUserPermissions, getUserRoles, getRolePermissions } =
  await import('../api/auth.api')

describe('bootstrapPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('merges direct + role permissions', async () => {
    const mockUser: User = {
      id: 'user-1',
      username: 'test',
      is_active: true,
      roles: [],
      direct_permissions: [],
      last_active_at: null,
      deleted_at: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockDirectPerms: UserPermission[] = [
      {
        id: 1,
        user_id: 'user-1',
        permission: 'a',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    const mockRole: Role = {
      id: 1,
      name: 'role-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockRolePerms: RolePermission[] = [
      {
        id: 1,
        role_id: 1,
        permission: 'b',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(getUsers).mockResolvedValue({
      content: [mockUser],
      page_number: 1,
      page_size: 20,
      count: 1,
    } as PaginatedResponse<User>)
    vi.mocked(getUserPermissions).mockResolvedValue(mockDirectPerms)
    vi.mocked(getUserRoles).mockResolvedValue([mockRole])
    vi.mocked(getRolePermissions).mockResolvedValue(mockRolePerms)

    const result = await bootstrapPermissions('test')

    expect(result).toEqual({
      userId: 'user-1',
      permissions: ['a', 'b'],
    })
  })

  it('deduplicates permissions', async () => {
    const mockUser: User = {
      id: 'user-1',
      username: 'test',
      is_active: true,
      roles: [],
      direct_permissions: [],
      last_active_at: null,
      deleted_at: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockDirectPerms: UserPermission[] = [
      {
        id: 1,
        user_id: 'user-1',
        permission: 'a',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        user_id: 'user-1',
        permission: 'b',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    const mockRole: Role = {
      id: 1,
      name: 'role-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockRolePerms: RolePermission[] = [
      {
        id: 1,
        role_id: 1,
        permission: 'b',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        role_id: 1,
        permission: 'c',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(getUsers).mockResolvedValue({
      content: [mockUser],
      page_number: 1,
      page_size: 20,
      count: 1,
    } as PaginatedResponse<User>)
    vi.mocked(getUserPermissions).mockResolvedValue(mockDirectPerms)
    vi.mocked(getUserRoles).mockResolvedValue([mockRole])
    vi.mocked(getRolePermissions).mockResolvedValue(mockRolePerms)

    const result = await bootstrapPermissions('test')

    expect(result).toEqual({
      userId: 'user-1',
      permissions: ['a', 'b', 'c'],
    })
  })

  it('returns empty when user not found', async () => {
    vi.mocked(getUsers).mockResolvedValue({
      content: [],
      page_number: 1,
      page_size: 20,
      count: 0,
    } as PaginatedResponse<User>)

    const result = await bootstrapPermissions('test')

    expect(result).toEqual({
      userId: '',
      permissions: [],
    })
  })

  it('returns empty on API failure', async () => {
    vi.mocked(getUsers).mockRejectedValue(new Error('API error'))

    const result = await bootstrapPermissions('test')

    expect(result).toEqual({
      userId: '',
      permissions: [],
    })
  })

  it('handles multiple roles with deduplication', async () => {
    const mockUser: User = {
      id: 'user-1',
      username: 'test',
      is_active: true,
      roles: [],
      direct_permissions: [],
      last_active_at: null,
      deleted_at: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockDirectPerms: UserPermission[] = [
      {
        id: 1,
        user_id: 'user-1',
        permission: 'a',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    const mockRole1: Role = {
      id: 1,
      name: 'role-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockRole2: Role = {
      id: 2,
      name: 'role-2',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockRole1Perms: RolePermission[] = [
      {
        id: 1,
        role_id: 1,
        permission: 'b',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        role_id: 1,
        permission: 'c',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    const mockRole2Perms: RolePermission[] = [
      {
        id: 3,
        role_id: 2,
        permission: 'c',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 4,
        role_id: 2,
        permission: 'd',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(getUsers).mockResolvedValue({
      content: [mockUser],
      page_number: 1,
      page_size: 20,
      count: 1,
    } as PaginatedResponse<User>)
    vi.mocked(getUserPermissions).mockResolvedValue(mockDirectPerms)
    vi.mocked(getUserRoles).mockResolvedValue([mockRole1, mockRole2])
    vi.mocked(getRolePermissions)
      .mockResolvedValueOnce(mockRole1Perms)
      .mockResolvedValueOnce(mockRole2Perms)

    const result = await bootstrapPermissions('test')

    expect(result).toEqual({
      userId: 'user-1',
      permissions: ['a', 'b', 'c', 'd'],
    })
  })
})
