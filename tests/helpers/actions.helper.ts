import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function openActionMenu(page: Page, rowText: string): Promise<void> {
  const row = page.locator('table tbody tr', { hasText: rowText })
  await row.getByRole('button').click()
}

export async function createUser(page: Page, name?: string): Promise<string> {
  const username = name ?? `e2e_user_${Date.now().toString()}`
  await page.getByRole('button', { name: /create user/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
  await page.getByLabel(/username/i).fill(username)
  await page.getByLabel(/password/i).fill('TestPassword123!')
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /create/i })
    .click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
  await expect(page.locator('table')).toContainText(username, { timeout: 5_000 })
  return username
}

export async function editUser(page: Page, currentName: string, newName?: string): Promise<string> {
  const updatedName = newName ?? `${currentName}_edited`
  await openActionMenu(page, currentName)
  await page.getByRole('menuitem', { name: /edit user/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
  const usernameInput = page.getByRole('dialog').getByLabel(/username/i)
  await usernameInput.clear()
  await usernameInput.fill(updatedName)
  await page.getByRole('dialog').getByRole('button', { name: /save/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
  await expect(page.locator('table')).toContainText(updatedName, { timeout: 5_000 })
  return updatedName
}

export async function disableUser(page: Page, username: string): Promise<void> {
  await openActionMenu(page, username)
  await page.getByRole('menuitem', { name: /disable user/i }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 3_000 })
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: /confirm/i })
    .click()
  await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 5_000 })
}

export async function enableUser(page: Page, username: string): Promise<void> {
  await openActionMenu(page, username)
  await page.getByRole('menuitem', { name: /enable user/i }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 3_000 })
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: /confirm/i })
    .click()
  await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 5_000 })
}

export async function createRole(page: Page, name?: string): Promise<string> {
  const roleName = name ?? `e2e-role-${Date.now().toString()}`
  await page.getByRole('button', { name: /create role/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
  await page.getByRole('dialog').getByLabel(/name/i).fill(roleName)
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /create/i })
    .click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
  await expect(page.locator('table')).toContainText(roleName, { timeout: 5_000 })
  return roleName
}

export async function editRole(page: Page, currentName: string, newName?: string): Promise<string> {
  const updatedName = newName ?? `${currentName}-edited`
  await openActionMenu(page, currentName)
  await page.getByRole('menuitem', { name: /edit role/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
  const nameInput = page.getByRole('dialog').getByLabel(/name/i)
  await nameInput.clear()
  await nameInput.fill(updatedName)
  await page.getByRole('dialog').getByRole('button', { name: /save/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
  await expect(page.locator('table')).toContainText(updatedName, { timeout: 5_000 })
  return updatedName
}

export async function deleteRole(page: Page, roleName: string): Promise<void> {
  await openActionMenu(page, roleName)
  await page.getByRole('menuitem', { name: /delete role/i }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 3_000 })
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: /delete/i })
    .click()
  await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 5_000 })
  await expect(page.locator('table')).not.toContainText(roleName, { timeout: 5_000 })
}
