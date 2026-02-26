import { describe, expect, it } from 'vitest'
import { PERMISSIONS, ALL_PERMISSIONS, PERMISSION_GROUPS } from './permissions'

describe('permissions', () => {
  it('defines all expected permissions', () => {
    expect(PERMISSIONS.USER_READ).toBe('auth:user:read')
    expect(PERMISSIONS.USER_MANAGE).toBe('auth:user:manage')
    expect(PERMISSIONS.ROLE_READ).toBe('auth:role:read')
    expect(PERMISSIONS.ROLE_MANAGE).toBe('auth:role:manage')
    expect(PERMISSIONS.ACCESS_READ).toBe('auth:access:read')
    expect(PERMISSIONS.ACCESS_MANAGE).toBe('auth:access:manage')
    expect(PERMISSIONS.SESSION_READ).toBe('auth:session:read')
    expect(PERMISSIONS.SESSION_MANAGE).toBe('auth:session:manage')
    expect(PERMISSIONS.ACTION_LOG_READ).toBe('audit:action-log:read')
    expect(PERMISSIONS.STATUS_CHANGE_LOG_READ).toBe('audit:status-change-log:read')
    expect(PERMISSIONS.TASKMILL_VIEW).toBe('taskmill:view')
    expect(PERMISSIONS.TASKMILL_MANAGE).toBe('taskmill:manage')
    expect(PERMISSIONS.ALERT_VIEW).toBe('alert:view')
    expect(PERMISSIONS.ALERT_MANAGE).toBe('alert:manage')
    expect(PERMISSIONS.CATALOG_MOVIE_READ).toBe('catalog:movie:read')
    expect(PERMISSIONS.CATALOG_MOVIE_MANAGE).toBe('catalog:movie:manage')
  })

  it('ALL_PERMISSIONS contains all defined permissions', () => {
    const values = Object.values(PERMISSIONS)
    expect(ALL_PERMISSIONS).toEqual(values)
    expect(ALL_PERMISSIONS).toHaveLength(16)
  })

  it('PERMISSION_GROUPS covers all permissions', () => {
    const grouped = Object.values(PERMISSION_GROUPS).flat()
    expect(grouped).toHaveLength(ALL_PERMISSIONS.length)
    for (const perm of ALL_PERMISSIONS) {
      expect(grouped).toContain(perm)
    }
  })

  it('has four permission groups', () => {
    expect(Object.keys(PERMISSION_GROUPS)).toEqual(['auth', 'audit', 'platform', 'catalog'])
  })
})
