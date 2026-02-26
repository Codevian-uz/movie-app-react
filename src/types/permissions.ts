export const PERMISSIONS = {
  USER_READ: 'auth:user:read',
  USER_MANAGE: 'auth:user:manage',
  ROLE_READ: 'auth:role:read',
  ROLE_MANAGE: 'auth:role:manage',
  ACCESS_READ: 'auth:access:read',
  ACCESS_MANAGE: 'auth:access:manage',
  SESSION_READ: 'auth:session:read',
  SESSION_MANAGE: 'auth:session:manage',
  ACTION_LOG_READ: 'audit:action-log:read',
  STATUS_CHANGE_LOG_READ: 'audit:status-change-log:read',
  TASKMILL_VIEW: 'taskmill:view',
  TASKMILL_MANAGE: 'taskmill:manage',
  ALERT_VIEW: 'alert:view',
  ALERT_MANAGE: 'alert:manage',
  CATALOG_MOVIE_READ: 'catalog:movie:read',
  CATALOG_MOVIE_MANAGE: 'catalog:movie:manage',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS)

export const PERMISSION_GROUPS: Record<string, Permission[]> = {
  auth: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_MANAGE,
    PERMISSIONS.ACCESS_READ,
    PERMISSIONS.ACCESS_MANAGE,
    PERMISSIONS.SESSION_READ,
    PERMISSIONS.SESSION_MANAGE,
  ],
  audit: [PERMISSIONS.ACTION_LOG_READ, PERMISSIONS.STATUS_CHANGE_LOG_READ],
  platform: [
    PERMISSIONS.TASKMILL_VIEW,
    PERMISSIONS.TASKMILL_MANAGE,
    PERMISSIONS.ALERT_VIEW,
    PERMISSIONS.ALERT_MANAGE,
  ],
  catalog: [PERMISSIONS.CATALOG_MOVIE_READ, PERMISSIONS.CATALOG_MOVIE_MANAGE],
}
