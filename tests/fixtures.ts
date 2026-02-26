import { test as base, type Page } from '@playwright/test'
import { loginViaAPI } from './helpers/auth.helper'

interface WorkerFixtures {
  workerAdmin: { username: string; password: string }
  workerViewer: { username: string; password: string }
}

interface TestFixtures {
  adminPage: Page
  viewerPage: Page
}

/**
 * Worker fixtures provide pre-created credentials — no API calls needed.
 * All users are bootstrapped in auth.setup.ts before any test runs.
 */
/* eslint-disable react-hooks/rules-of-hooks */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  workerAdmin: [
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type, no-empty-pattern
    async ({}: {}, use, workerInfo) => {
      await use({
        username: `pw-admin-w${workerInfo.workerIndex.toString()}`,
        password: 'E2eAdmin123!',
      })
    },
    { scope: 'worker' },
  ],

  workerViewer: [
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type, no-empty-pattern
    async ({}: {}, use, workerInfo) => {
      await use({
        username: `pw-viewer-w${workerInfo.workerIndex.toString()}`,
        password: 'E2eViewer123!',
      })
    },
    { scope: 'worker' },
  ],

  adminPage: async ({ page, workerAdmin }, use) => {
    await loginViaAPI(page, workerAdmin.username, workerAdmin.password)
    await use(page)
  },

  viewerPage: async ({ browser, workerViewer }, use) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await loginViaAPI(page, workerViewer.username, workerViewer.password)
    await use(page)
    await context.close()
  },
})

export { expect } from '@playwright/test'
