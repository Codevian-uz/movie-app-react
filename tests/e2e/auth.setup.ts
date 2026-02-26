import { test as setup } from '@playwright/test'
import { superadminLogin, bootstrapUserWithPermissions } from '../helpers/api.helper'
import {
  ALL_PERMISSIONS,
  VIEWER_PERMISSIONS,
  ADMIN_USER,
  VIEWER_USER,
  MAX_WORKERS,
} from '../helpers/fixtures'

setup('bootstrap test data', async () => {
  const token = await superadminLogin()

  // Create named users for auth.spec.ts (unauthenticated tests)
  await bootstrapUserWithPermissions(
    token,
    ADMIN_USER.username,
    ADMIN_USER.password,
    ALL_PERMISSIONS,
  )
  await bootstrapUserWithPermissions(
    token,
    VIEWER_USER.username,
    VIEWER_USER.password,
    VIEWER_PERMISSIONS,
  )

  // Pre-create per-worker admin and viewer users for all possible worker indices.
  // This avoids superadmin session contention — workers just use pre-created credentials.
  const workerPromises: Promise<unknown>[] = []
  for (let i = 0; i < MAX_WORKERS; i++) {
    workerPromises.push(
      bootstrapUserWithPermissions(
        token,
        `pw-admin-w${i.toString()}`,
        'E2eAdmin123!',
        ALL_PERMISSIONS,
      ),
      bootstrapUserWithPermissions(
        token,
        `pw-viewer-w${i.toString()}`,
        'E2eViewer123!',
        VIEWER_PERMISSIONS,
      ),
    )
  }
  await Promise.all(workerPromises)
})
