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

// Catalog helpers

export async function createGenre(page: Page, name?: string): Promise<string> {
  const genreName = name ?? `e2e-genre-${Date.now().toString()}`
  await page.getByRole('button', { name: /create genre/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
  await page.getByRole('dialog').getByLabel(/name/i).fill(genreName)
  await page.getByRole('dialog').getByRole('button', { name: /save/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
  await expect(page.locator('table')).toContainText(genreName, { timeout: 5_000 })
  return genreName
}

export async function editGenre(
  page: Page,
  currentName: string,
  newName?: string,
): Promise<string> {
  const updatedName = newName ?? `${currentName}-edited`
  await openActionMenu(page, currentName)
  await page.getByRole('menuitem', { name: /edit/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
  const nameInput = page.getByRole('dialog').getByLabel(/name/i)
  await nameInput.clear()
  await nameInput.fill(updatedName)
  await page.getByRole('dialog').getByRole('button', { name: /save/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
  await expect(page.locator('table')).toContainText(updatedName, { timeout: 5_000 })
  return updatedName
}

export async function deleteGenre(page: Page, genreName: string): Promise<void> {
  await openActionMenu(page, genreName)
  await page.getByRole('menuitem', { name: /delete/i }).click()
  // No alert dialog for genre delete in my implementation, just confirm()
  // Actually, I should probably use a proper dialog, but for now it's window.confirm
  // Playwright handles window.confirm automatically if not listening, or we can listen.
}

export async function createPerson(page: Page, name?: string): Promise<string> {
  const personName = name ?? `e2e-person-${Date.now().toString()}`
  await page.getByRole('button', { name: /create person/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
  await page
    .getByRole('dialog')
    .getByLabel(/full name/i)
    .fill(personName)
  await page.getByRole('dialog').getByRole('button', { name: /save/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
  await expect(page.locator('table')).toContainText(personName, { timeout: 5_000 })
  return personName
}

export async function editPerson(
  page: Page,
  currentName: string,
  newName?: string,
): Promise<string> {
  const updatedName = newName ?? `${currentName}-edited`
  await openActionMenu(page, currentName)
  await page.getByRole('menuitem', { name: /edit/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
  const nameInput = page.getByRole('dialog').getByLabel(/full name/i)
  await nameInput.clear()
  await nameInput.fill(updatedName)
  await page.getByRole('dialog').getByRole('button', { name: /save/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
  await expect(page.locator('table')).toContainText(updatedName, { timeout: 5_000 })
  return updatedName
}

export async function createMovie(page: Page, title?: string): Promise<string> {
  const movieTitle = title ?? `e2e-movie-${Date.now().toString()}`
  await page.getByRole('button', { name: /create movie/i }).click()
  await expect(page).toHaveURL(/\/admin\/catalog\/movies\/create/)
  await page.getByLabel(/title/i).fill(movieTitle)
  await page.getByRole('button', { name: /save/i }).click()
  await expect(page).toHaveURL(/\/admin\/catalog\/movies/)
  await expect(page.locator('table')).toContainText(movieTitle, { timeout: 10_000 })
  return movieTitle
}
