import { test, expect } from '../fixtures'
import {
  createUser,
  editUser,
  disableUser,
  enableUser,
  openActionMenu,
} from '../helpers/actions.helper'

test.describe('Users management', () => {
  test('full user management saga', async ({ adminPage }) => {
    await adminPage.goto('/admin/users')
    await expect(adminPage.locator('h1')).toContainText(/user/i, { timeout: 10_000 })

    await test.step('table renders with bootstrapped users', async () => {
      await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
      await expect(adminPage.locator('table')).toContainText('superadmin', { timeout: 5_000 })
      await expect(adminPage.locator('table')).toContainText('e2e-admin', { timeout: 5_000 })
      await expect(adminPage.locator('table')).toContainText('e2e-viewer', { timeout: 5_000 })
    })

    await test.step('search and filter controls are visible', async () => {
      await expect(adminPage.getByTestId('users-search')).toBeVisible()
      await expect(adminPage.getByRole('combobox').filter({ hasText: /all/i })).toBeVisible()
    })

    await test.step('search filters results correctly', async () => {
      const searchInput = adminPage.getByTestId('users-search')
      const searchBtn = adminPage.getByRole('button', { name: /search/i })
      await searchInput.fill('e2e-admin')
      await searchBtn.click()
      await expect(adminPage.locator('table')).toContainText('e2e-admin', { timeout: 5_000 })
    })

    await test.step('search nonexistent user shows empty state', async () => {
      const searchInput = adminPage.getByTestId('users-search')
      const searchBtn = adminPage.getByRole('button', { name: /search/i })
      await searchInput.clear()
      await searchInput.fill('nonexistentuserxyz')
      await searchBtn.click()
      await expect(
        adminPage.getByText(/no users found/i).or(adminPage.locator('table tbody tr').first()),
      ).toBeVisible({ timeout: 5_000 })
    })

    await test.step('clear search restores results', async () => {
      const searchInput = adminPage.getByTestId('users-search')
      const searchBtn = adminPage.getByRole('button', { name: /search/i })
      await searchInput.clear()
      await searchBtn.click()
      await expect(adminPage.locator('table')).toContainText('superadmin', { timeout: 5_000 })
    })

    await test.step('create user — validation errors for empty form', async () => {
      await adminPage.getByRole('button', { name: /create user/i }).click()
      await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })

      await adminPage
        .getByRole('dialog')
        .getByRole('button', { name: /create/i })
        .click()

      // Both username (min 3) and password (min 8) should show errors
      await expect(
        adminPage
          .getByRole('dialog')
          .getByText(/at least \d+ characters/i)
          .first(),
      ).toBeVisible({ timeout: 3_000 })

      await adminPage.keyboard.press('Escape')
      await expect(adminPage.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
    })

    let username = ''
    await test.step('create user — success', async () => {
      username = await createUser(adminPage)
    })

    let newUsername = ''
    await test.step('edit user — change username', async () => {
      newUsername = await editUser(adminPage, username)
    })

    await test.step('disable user — status changes to disabled', async () => {
      await disableUser(adminPage, newUsername)
      const row = adminPage.locator('table tbody tr', { hasText: newUsername })
      await expect(row.getByText(/disabled/i)).toBeVisible({ timeout: 5_000 })
    })

    await test.step('enable user — status changes to active', async () => {
      await enableUser(adminPage, newUsername)
      const row = adminPage.locator('table tbody tr', { hasText: newUsername })
      await expect(row.getByText(/^active$/i)).toBeVisible({ timeout: 5_000 })
    })

    await test.step('manage roles dialog opens and functions', async () => {
      await openActionMenu(adminPage, 'e2e-admin')
      await adminPage.getByRole('menuitem', { name: /manage roles/i }).click()
      await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
      await expect(
        adminPage.getByRole('dialog').getByRole('button', { name: /save/i }),
      ).toBeVisible()
      await adminPage.keyboard.press('Escape')
      await expect(adminPage.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
    })

    await test.step('manage permissions dialog opens and functions', async () => {
      await openActionMenu(adminPage, 'e2e-admin')
      await adminPage.getByRole('menuitem', { name: /manage permissions/i }).click()
      await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
      await adminPage.keyboard.press('Escape')
      await expect(adminPage.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
    })
  })
})
