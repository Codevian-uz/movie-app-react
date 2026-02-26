import { test, expect } from '../fixtures'

test.describe('Sessions management', () => {
  test('full sessions saga', async ({ adminPage }) => {
    await adminPage.goto('/admin/sessions')
    await expect(adminPage.locator('h1')).toContainText(/session/i, { timeout: 10_000 })

    await test.step('search UI present, no table before search', async () => {
      await expect(adminPage.getByPlaceholder(/user id/i)).toBeVisible()
      await expect(adminPage.getByRole('button', { name: /search/i })).toBeVisible()
      await expect(adminPage.locator('table')).not.toBeVisible()
    })

    const userId = await adminPage.evaluate(() => {
      const raw = localStorage.getItem('auth-storage')
      if (raw === null) {
        return ''
      }
      const parsed = JSON.parse(raw) as { state?: { userId?: string } }
      return parsed.state?.userId ?? ''
    })

    await test.step('search by user ID shows sessions table', async () => {
      await adminPage.getByPlaceholder(/user id/i).fill(userId)
      await adminPage.getByRole('button', { name: /search/i }).click()
      await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
      await expect(adminPage.locator('table tbody tr').first()).toBeVisible()
    })

    await test.step('table has correct columns', async () => {
      await expect(adminPage.locator('th', { hasText: /ip address/i })).toBeVisible()
      await expect(adminPage.locator('th', { hasText: /browser/i })).toBeVisible()
      await expect(adminPage.locator('th', { hasText: /last used/i })).toBeVisible()
      await expect(adminPage.locator('th', { hasText: /created/i })).toBeVisible()
      await expect(adminPage.locator('th', { hasText: /expires/i })).toBeVisible()
    })

    await test.step('revoke single session — dialog appears and cancels', async () => {
      const firstRevokeButton = adminPage
        .locator('table tbody')
        .getByRole('button', { name: /^revoke$/i })
        .first()
      await firstRevokeButton.click()

      const alertDialog = adminPage.getByRole('alertdialog')
      await expect(alertDialog).toBeVisible({ timeout: 3_000 })
      await expect(alertDialog).toContainText(/are you sure you want to revoke this session/i)
      await alertDialog.getByRole('button', { name: /cancel/i }).click()
      await expect(alertDialog).not.toBeVisible({ timeout: 3_000 })
    })

    await test.step('revoke all sessions — dialog appears and cancels', async () => {
      const revokeAllButton = adminPage.getByRole('button', { name: /revoke all/i })
      await expect(revokeAllButton).toBeVisible()
      await revokeAllButton.click()

      const alertDialog = adminPage.getByRole('alertdialog')
      await expect(alertDialog).toBeVisible({ timeout: 3_000 })
      await expect(alertDialog).toContainText(/are you sure you want to revoke all sessions/i)
      await alertDialog.getByRole('button', { name: /cancel/i }).click()
      await expect(alertDialog).not.toBeVisible({ timeout: 3_000 })
    })
  })
})
