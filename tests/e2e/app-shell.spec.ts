import { test, expect } from '../fixtures'

test.describe('App shell', () => {
  test('dashboard, navigation, settings, and profile saga', async ({ adminPage }) => {
    await test.step('dashboard — displays all sections', async () => {
      await adminPage.goto('/admin')
      await expect(adminPage.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })
      await expect(adminPage.getByText(/welcome/i)).toBeVisible()

      const content = adminPage.locator('main main')
      await expect(content.getByText(/total users/i)).toBeVisible({ timeout: 10_000 })
      await expect(content.getByText(/active sessions/i)).toBeVisible({ timeout: 10_000 })
      await expect(content.getByText(/task schedules/i)).toBeVisible({ timeout: 10_000 })
      await expect(content.getByText(/queues health/i)).toBeVisible({ timeout: 10_000 })
      await expect(content.getByText(/total errors/i)).toBeVisible({ timeout: 10_000 })
      await expect(content.getByText(/by operation/i)).toBeVisible({ timeout: 10_000 })
      await expect(content.getByText(/by code/i)).toBeVisible({ timeout: 10_000 })
    })

    await test.step('sidebar — structure and app name', async () => {
      const sidebar = adminPage.locator('[data-sidebar="content"]')
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

      const sidebarHeader = adminPage.locator('[data-sidebar="header"]')
      await expect(sidebarHeader.getByText(/enterprise blueprint/i)).toBeVisible()
      await expect(adminPage.getByText(/log out/i)).toBeVisible()
      await expect(adminPage.locator('button[data-sidebar="trigger"]')).toBeVisible()
    })

    await test.step('navigation — links navigate to correct pages', async () => {
      await adminPage.getByRole('link', { name: /^users$/i }).click()
      await adminPage.waitForURL(/\/admin\/users/, { timeout: 5_000 })
      await expect(adminPage.locator('h1')).toContainText(/user/i)

      await adminPage.getByRole('link', { name: /^roles$/i }).click()
      await adminPage.waitForURL(/\/admin\/roles/, { timeout: 5_000 })
      await expect(adminPage.locator('h1')).toContainText(/role/i)

      await adminPage.getByRole('link', { name: /^sessions$/i }).click()
      await adminPage.waitForURL(/\/admin\/sessions/, { timeout: 5_000 })
      await expect(adminPage.locator('h1')).toContainText(/session/i)

      await adminPage.getByRole('link', { name: /action logs/i }).click()
      await adminPage.waitForURL(/\/admin\/audit\/action-logs/, { timeout: 5_000 })
      await expect(adminPage.locator('h1')).toContainText(/action.*log/i)

      await adminPage.getByRole('link', { name: /task queues/i }).click()
      await adminPage.waitForURL(/\/admin\/platform\/queues/, { timeout: 5_000 })
      await expect(adminPage.locator('h1')).toContainText(/queue/i)
    })

    await test.step('theme switcher — toggle dark and light', async () => {
      await adminPage.goto('/admin')
      await expect(adminPage.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })

      const themeTrigger = adminPage.getByRole('button', { name: /toggle theme/i })
      await expect(themeTrigger).toBeVisible()
      await themeTrigger.click()
      await expect(adminPage.getByRole('menuitem', { name: /light/i })).toBeVisible()
      await expect(adminPage.getByRole('menuitem', { name: /dark/i })).toBeVisible()
      await expect(adminPage.getByRole('menuitem', { name: /system/i })).toBeVisible()

      await adminPage.getByRole('menuitem', { name: /dark/i }).click()
      await expect(adminPage.locator('html')).toHaveClass(/dark/, { timeout: 3_000 })

      await adminPage.getByRole('button', { name: /toggle theme/i }).click()
      await adminPage.getByRole('menuitem', { name: /light/i }).click()
      await expect(adminPage.locator('html')).not.toHaveClass(/dark/, { timeout: 3_000 })
    })

    await test.step('language switcher — toggle language', async () => {
      const langTrigger = adminPage.getByRole('button', { name: /switch language/i })
      await expect(langTrigger).toBeVisible()
      await langTrigger.click()
      await expect(adminPage.getByRole('menuitem', { name: /english/i })).toBeVisible()
      await expect(adminPage.getByRole('menuitem', { name: /русский/i })).toBeVisible()
      await expect(adminPage.getByRole('menuitem', { name: /o'zbekcha/i })).toBeVisible()

      await adminPage.getByRole('menuitem', { name: /русский/i }).click()
      await expect(adminPage.locator('h1')).not.toContainText(/dashboard/i, { timeout: 3_000 })

      await adminPage.getByRole('button', { name: /язык/i }).click()
      await adminPage.getByRole('menuitem', { name: /english/i }).click()
      await expect(adminPage.locator('h1')).toContainText(/dashboard/i, { timeout: 3_000 })
    })

    await test.step('profile — change password validation', async () => {
      await adminPage.goto('/admin/profile')
      await expect(adminPage.locator('h1')).toContainText(/profile/i, { timeout: 10_000 })
      await expect(adminPage.getByText(/change password/i).first()).toBeVisible()

      // Submit empty form — validation errors
      await adminPage.getByRole('button', { name: /change password/i }).click()
      await expect(adminPage.getByText(/required/i).first()).toBeVisible({ timeout: 3_000 })

      // Wrong current password — server error
      await adminPage.getByLabel(/current password/i).fill('WrongPassword999!')
      await adminPage.getByLabel(/new password/i).fill('E2eAdmin123!')
      await adminPage.getByLabel(/confirm password/i).fill('E2eAdmin123!')
      await adminPage.getByRole('button', { name: /change password/i }).click()
      await expect(adminPage.locator('[role="alert"]')).toBeVisible({ timeout: 5_000 })

      // Password mismatch
      await adminPage.getByLabel(/current password/i).fill('E2eAdmin123!')
      await adminPage.getByLabel(/new password/i).fill('NewPassword123!')
      await adminPage.getByLabel(/confirm password/i).fill('DifferentPassword123!')
      await adminPage.getByRole('button', { name: /change password/i }).click()
      await expect(adminPage.getByText(/passwords do not match/i)).toBeVisible({ timeout: 3_000 })
    })

    await test.step('profile — my sessions table', async () => {
      await expect(adminPage.getByText(/my sessions/i)).toBeVisible()
      await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
      await expect(adminPage.locator('table tbody tr').first()).toBeVisible({ timeout: 5_000 })
      await expect(adminPage.locator('th', { hasText: /ip address/i })).toBeVisible()
      await expect(adminPage.locator('th', { hasText: /browser/i })).toBeVisible()
      await expect(
        adminPage
          .locator('table')
          .getByRole('button', { name: /revoke/i })
          .first(),
      ).toBeVisible()
    })

    await test.step('logout redirects to login', async () => {
      await adminPage.getByText(/log out/i).click()
      await adminPage.waitForURL(/\/admin\/login/, { timeout: 10_000 })
      await expect(adminPage.getByLabel(/username/i)).toBeVisible()
    })
  })
})
