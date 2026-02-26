/**
 * Test fixtures for E2E tests.
 *
 * Pre-defined users and permission sets.
 */

export const ADMIN_USER = { username: 'e2e-admin', password: 'E2eAdmin123!' }
export const VIEWER_USER = { username: 'e2e-viewer', password: 'E2eViewer123!' }
export const SUPERADMIN_USER = { username: 'superadmin', password: 'superadmin123' }

/** Maximum number of parallel workers. Users are pre-created for indices 0..MAX_WORKERS-1. */
export const MAX_WORKERS = 12

/**
 * All permissions for full-access admin.
 */
export const ALL_PERMISSIONS = [
  'auth:user:read',
  'auth:user:manage',
  'auth:role:read',
  'auth:role:manage',
  'auth:access:read',
  'auth:access:manage',
  'auth:session:read',
  'auth:session:manage',
  'audit:action-log:read',
  'audit:status-change-log:read',
  'taskmill:view',
  'taskmill:manage',
  'alert:view',
  'alert:manage',
]

/**
 * Read-only permissions for viewer user.
 */
export const VIEWER_PERMISSIONS = [
  'auth:user:read',
  'auth:role:read',
  'auth:access:read',
  'auth:session:read',
  'audit:action-log:read',
  'audit:status-change-log:read',
  'taskmill:view',
  'alert:view',
]
