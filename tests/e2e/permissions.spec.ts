import { test, expect } from '../fixtures'
import { loginViaAPI } from '../helpers/auth.helper'

test.describe('Permissions', () => {
  test('route guards redirect users without required permissions', async ({ page }) => {
    // Intercept API calls to prevent 401 → clearAuth → redirect to login
    await page.route('**/api/**', (route) => route.fulfill({ status: 200, body: '{"content":[]}' }))

    // Inject minimal auth with only auth:user:read
    await page.goto('/')
    await page.evaluate(() => {
      const authStorage = {
        state: {
          accessToken: 'fake-token-for-route-test',
          refreshToken: 'fake-refresh',
          isAuthenticated: true,
          userId: 'test-user',
          username: 'test-user',
          permissions: ['auth:user:read'],
        },
        version: 0,
      }
      localStorage.setItem('auth-storage', JSON.stringify(authStorage))
      localStorage.setItem(
        'locale-storage',
        JSON.stringify({ state: { locale: 'en' }, version: 0 }),
      )
    })

    await test.step('redirects from /admin/platform/queues without TASKMILL_VIEW', async () => {
      await page.goto('/admin/platform/queues')
      await page.waitForURL(/\/admin\/?$/, { timeout: 10_000 })
      expect(page.url()).toMatch(/\/admin\/?$/)
    })

    await test.step('redirects from /admin/audit/action-logs without ACTION_LOG_READ', async () => {
      await page.goto('/admin/audit/action-logs')
      await page.waitForURL(/\/admin\/?$/, { timeout: 10_000 })
      expect(page.url()).toMatch(/\/admin\/?$/)
    })

    await test.step('redirects from /admin/platform/errors without ALERT_VIEW', async () => {
      await page.goto('/admin/platform/errors')
      await page.waitForURL(/\/admin\/?$/, { timeout: 10_000 })
      expect(page.url()).toMatch(/\/admin\/?$/)
    })

    await test.step('redirects from /admin/roles without ROLE_READ', async () => {
      await page.goto('/admin/roles')
      await page.waitForURL(/\/admin\/?$/, { timeout: 10_000 })
      expect(page.url()).toMatch(/\/admin\/?$/)
    })

    await test.step('redirects from /admin/sessions without SESSION_READ', async () => {
      await page.goto('/admin/sessions')
      await page.waitForURL(/\/admin\/?$/, { timeout: 10_000 })
      expect(page.url()).toMatch(/\/admin\/?$/)
    })

    await test.step('allows /admin/users with USER_READ', async () => {
      await page.goto('/admin/users')
      await page.waitForURL(/\/admin\/users/, { timeout: 10_000 })
      expect(page.url()).toMatch(/\/admin\/users/)
    })
  })

  test('minimal user sees restricted sidebar and dashboard', async ({ page }) => {
    // Intercept API calls to prevent 401 → clearAuth → redirect to login
    await page.route('**/api/**', (route) => route.fulfill({ status: 200, body: '{"content":[]}' }))

    await page.goto('/')
    await page.evaluate(() => {
      const authStorage = {
        state: {
          accessToken: 'fake-token-for-route-test',
          refreshToken: 'fake-refresh',
          isAuthenticated: true,
          userId: 'test-user',
          username: 'test-user',
          permissions: ['auth:user:read'],
        },
        version: 0,
      }
      localStorage.setItem('auth-storage', JSON.stringify(authStorage))
      localStorage.setItem(
        'locale-storage',
        JSON.stringify({ state: { locale: 'en' }, version: 0 }),
      )
    })
    await page.goto('/admin')
    await expect(page.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })

    await test.step('sidebar shows only permitted links', async () => {
      const sidebar = page.locator('[data-sidebar="content"]')
      await expect(sidebar.getByRole('link', { name: /dashboard/i })).toBeVisible()
      await expect(sidebar.getByRole('link', { name: /^users$/i })).toBeVisible()

      await expect(sidebar.getByRole('link', { name: /^roles$/i })).not.toBeVisible()
      await expect(sidebar.getByRole('link', { name: /^sessions$/i })).not.toBeVisible()
      await expect(sidebar.getByRole('link', { name: /action logs/i })).not.toBeVisible()
      await expect(sidebar.getByRole('link', { name: /status changes/i })).not.toBeVisible()
      await expect(sidebar.getByRole('link', { name: /task queues/i })).not.toBeVisible()
      await expect(sidebar.getByRole('link', { name: /task dlq/i })).not.toBeVisible()
      await expect(sidebar.getByRole('link', { name: /task results/i })).not.toBeVisible()
      await expect(sidebar.getByRole('link', { name: /task schedules/i })).not.toBeVisible()
      await expect(sidebar.getByRole('link', { name: /^errors$/i })).not.toBeVisible()
    })

    await test.step('dashboard shows only auth stats, hides tasks and errors', async () => {
      await expect(page.getByText(/total users/i)).toBeVisible({ timeout: 5_000 })
      await expect(page.getByText(/task schedules/i)).not.toBeVisible()
      await expect(page.getByText(/total errors/i)).not.toBeVisible()
    })
  })

  test('viewer sees content but cannot perform manage actions', async ({ page, workerViewer }) => {
    await loginViaAPI(page, workerViewer.username, workerViewer.password)

    await test.step('sidebar shows all permitted links', async () => {
      await page.goto('/admin')
      await expect(page.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })
      const sidebar = page.locator('[data-sidebar="content"]')
      await expect(sidebar.getByRole('link', { name: /^users$/i })).toBeVisible()
      await expect(sidebar.getByRole('link', { name: /^roles$/i })).toBeVisible()
      await expect(sidebar.getByRole('link', { name: /^sessions$/i })).toBeVisible()
      await expect(sidebar.getByRole('link', { name: /action logs/i })).toBeVisible()
      await expect(sidebar.getByRole('link', { name: /status changes/i })).toBeVisible()
      await expect(sidebar.getByRole('link', { name: /task queues/i })).toBeVisible()
      await expect(sidebar.getByRole('link', { name: /task dlq/i })).toBeVisible()
      await expect(sidebar.getByRole('link', { name: /task results/i })).toBeVisible()
      await expect(sidebar.getByRole('link', { name: /task schedules/i })).toBeVisible()
      await expect(sidebar.getByRole('link', { name: /^errors$/i })).toBeVisible()
    })

    await test.step('dashboard shows all sections', async () => {
      const content = page.locator('main main')
      await expect(content.getByText(/total users/i)).toBeVisible({ timeout: 10_000 })
      await expect(content.getByText(/active sessions/i)).toBeVisible({ timeout: 10_000 })
      await expect(content.getByText(/task schedules/i)).toBeVisible({ timeout: 10_000 })
      await expect(content.getByText(/queues health/i)).toBeVisible({ timeout: 10_000 })
      await expect(content.getByText(/total errors/i)).toBeVisible({ timeout: 10_000 })
    })

    await test.step('users page — no create button, no action menu', async () => {
      await page.goto('/admin/users')
      await expect(page.locator('h1')).toContainText(/user/i, { timeout: 10_000 })
      await expect(page.locator('table')).toBeVisible({ timeout: 5_000 })
      await expect(page.getByRole('button', { name: /create user/i })).not.toBeVisible()

      const row = page.locator('table tbody tr', { hasText: workerViewer.username })
      const dropdownBtn = row.getByRole('button')
      if ((await dropdownBtn.count()) > 0) {
        await dropdownBtn.first().click()
        await expect(page.getByRole('menuitem', { name: /edit user/i })).not.toBeVisible()
        await expect(page.getByRole('menuitem', { name: /disable user/i })).not.toBeVisible()
        await expect(page.getByRole('menuitem', { name: /manage roles/i })).not.toBeVisible()
        await expect(page.getByRole('menuitem', { name: /manage permissions/i })).not.toBeVisible()
      }
    })

    await test.step('roles page — no create button', async () => {
      await page.goto('/admin/roles')
      await expect(page.locator('h1')).toContainText(/role/i, { timeout: 10_000 })
      await expect(page.locator('table')).toBeVisible({ timeout: 5_000 })
      await expect(page.getByRole('button', { name: /create role/i })).not.toBeVisible()
    })

    await test.step('sessions page — no revoke buttons', async () => {
      await page.goto('/admin/sessions')
      await expect(page.locator('h1')).toContainText(/session/i, { timeout: 10_000 })

      const userId = await page.evaluate(() => {
        const raw = localStorage.getItem('auth-storage')
        if (raw === null) {
          return ''
        }
        const parsed = JSON.parse(raw) as { state?: { userId?: string } }
        return parsed.state?.userId ?? ''
      })

      await page.getByPlaceholder(/user id/i).fill(userId)
      await page.getByRole('button', { name: /search/i }).click()
      await expect(page.locator('table')).toBeVisible({ timeout: 5_000 })
      await expect(page.getByRole('button', { name: /revoke/i })).not.toBeVisible()
    })

    await test.step('queues page — no purge buttons', async () => {
      await page.goto('/admin/platform/queues')
      await expect(page.locator('h1')).toContainText(/queue/i, { timeout: 10_000 })
      await expect(page.getByRole('button', { name: /purge queue/i })).not.toBeVisible()
      await expect(page.getByRole('button', { name: /purge dlq/i })).not.toBeVisible()
    })

    await test.step('errors page — no cleanup button', async () => {
      await page.goto('/admin/platform/errors')
      await expect(page.locator('h1')).toContainText(/error/i, { timeout: 10_000 })
      await expect(page.getByRole('button', { name: /cleanup/i })).not.toBeVisible()
    })

    await test.step('permissions survive page refresh', async () => {
      await page.goto('/admin')
      await expect(page.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })
      await page.reload()
      await expect(page.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })

      const sidebar = page.locator('[data-sidebar="content"]')
      await expect(sidebar.getByRole('link', { name: /^users$/i })).toBeVisible()

      const hasPerms = await page.evaluate(() => {
        const raw = localStorage.getItem('auth-storage')
        if (raw === null) {
          return false
        }
        const parsed = JSON.parse(raw) as { state?: { permissions?: unknown[] } }
        return Array.isArray(parsed.state?.permissions) && parsed.state.permissions.length > 0
      })
      expect(hasPerms).toBe(true)
    })
  })
})
