import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../helpers/fixtures'

test.describe('Authentication', () => {
  test.use({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:4173',
          localStorage: [
            {
              name: 'locale-storage',
              value: JSON.stringify({ state: { locale: 'en' }, version: 0 }),
            },
          ],
        },
      ],
    },
  })

  test('authentication saga — welcome, login, validation, and redirects', async ({ page }) => {
    await test.step('welcome page displays content and admin link', async () => {
      await page.goto('/')
      await expect(page).toHaveURL('/')
      await expect(page.getByText(/enterprise blueprint/i)).toBeVisible()
      const adminLink = page.getByRole('link', { name: /admin|panel|boshqaruv/i })
      await expect(adminLink).toBeVisible()
    })

    await test.step('admin link navigates to login when unauthenticated', async () => {
      await page.getByRole('link', { name: /admin|panel|boshqaruv/i }).click()
      await page.waitForURL(/\/admin\/login/, { timeout: 5_000 })
    })

    await test.step('login page renders form fields', async () => {
      await expect(page.getByLabel(/username/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /log in|sign in|kirish/i })).toBeVisible()
    })

    await test.step('unauthenticated user redirected from /admin to login', async () => {
      await page.goto('/admin')
      await page.waitForURL(/\/admin\/login/, { timeout: 5_000 })
      await expect(page).toHaveURL(/\/admin\/login/)
    })

    await test.step('invalid credentials show error alert', async () => {
      await page.goto('/admin/login')
      await page.getByLabel(/username/i).fill('baduser')
      await page.getByLabel(/password/i).fill('badpassword')
      await page.getByRole('button', { name: /log in|sign in|kirish/i }).click()

      await expect(page.locator('[role="alert"], .text-destructive')).toBeVisible({
        timeout: 5_000,
      })
    })

    await test.step('successful login redirects to dashboard', async () => {
      await page.goto('/admin/login')
      await page.getByLabel(/username/i).fill(ADMIN_USER.username)
      await page.getByLabel(/password/i).fill(ADMIN_USER.password)
      await page.getByRole('button', { name: /log in|sign in|kirish/i }).click()

      await page.waitForURL(/\/admin(?!\/login)/, { timeout: 10_000 })
      await expect(page).not.toHaveURL(/\/admin\/login/)
      await expect(page.locator('h1')).toContainText(/dashboard/i)
    })

    await test.step('already-authenticated user redirected away from login', async () => {
      await page.goto('/admin/login')
      await page.waitForURL(/\/admin(?!\/login)/, { timeout: 5_000 })
      await expect(page).not.toHaveURL(/\/admin\/login/)
    })
  })
})
