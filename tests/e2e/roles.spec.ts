import { test, expect } from '../fixtures'
import { createRole, editRole, deleteRole, openActionMenu } from '../helpers/actions.helper'

test.describe('Roles management', () => {
  test('full role management saga', async ({ adminPage }) => {
    await adminPage.goto('/admin/roles')
    await expect(adminPage.locator('h1')).toContainText(/role/i, { timeout: 10_000 })

    await test.step('table renders with existing roles', async () => {
      await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
      await expect(adminPage.locator('table tbody tr').first()).toBeVisible()
    })

    await test.step('create role — validation error for empty name', async () => {
      await adminPage.getByRole('button', { name: /create role/i }).click()
      await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })

      await adminPage
        .getByRole('dialog')
        .getByRole('button', { name: /create/i })
        .click()

      await expect(adminPage.getByRole('dialog').getByText(/at least 3 characters/i)).toBeVisible({
        timeout: 3_000,
      })

      await adminPage.keyboard.press('Escape')
      await expect(adminPage.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
    })

    let roleName = ''
    await test.step('create role — success', async () => {
      roleName = await createRole(adminPage)
    })

    let newRoleName = ''
    await test.step('edit role — change name', async () => {
      newRoleName = await editRole(adminPage, roleName)
    })

    await test.step('manage permissions — toggle and save', async () => {
      await openActionMenu(adminPage, newRoleName)
      await adminPage.getByRole('menuitem', { name: /manage permissions/i }).click()
      await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })

      const checkboxes = adminPage.getByRole('dialog').getByRole('checkbox')
      await expect(checkboxes.first()).toBeVisible()
      await checkboxes.first().click()
      await adminPage.getByRole('dialog').getByRole('button', { name: /save/i }).click()
      await expect(adminPage.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
    })

    await test.step('delete role — confirm and verify removed', async () => {
      await deleteRole(adminPage, newRoleName)
    })
  })
})
