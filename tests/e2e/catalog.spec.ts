import { test, expect } from '../fixtures'
import {
  createGenre,
  editGenre,
  createPerson,
  editPerson,
  openActionMenu,
} from '../helpers/actions.helper'

test.describe('Catalog management', () => {
  test('full catalog management saga', async ({ adminPage }) => {
    // Genres
    await test.step('genre management', async () => {
      await adminPage.goto('/admin/catalog/genres')
      await expect(adminPage.locator('h1')).toContainText(/genres/i, { timeout: 10_000 })

      const genreName = await createGenre(adminPage)
      const editedGenreName = await editGenre(adminPage, genreName)

      // Delete
      adminPage.once('dialog', (dialog) => dialog.accept())
      await openActionMenu(adminPage, editedGenreName)
      await adminPage.getByRole('menuitem', { name: /delete/i }).click()
      await expect(adminPage.locator('table')).not.toContainText(editedGenreName, {
        timeout: 5_000,
      })
    })

    // People
    await test.step('people management', async () => {
      await adminPage.goto('/admin/catalog/people')
      await expect(adminPage.locator('h1')).toContainText(/people/i, { timeout: 10_000 })

      const personName = await createPerson(adminPage)
      const editedPersonName = await editPerson(adminPage, personName)

      // Delete
      adminPage.once('dialog', (dialog) => dialog.accept())
      await openActionMenu(adminPage, editedPersonName)
      await adminPage.getByRole('menuitem', { name: /delete/i }).click()
      await expect(adminPage.locator('table')).not.toContainText(editedPersonName, {
        timeout: 5_000,
      })
    })

    // Movies
    await test.step('movie management', async () => {
      // Create dependencies first
      await adminPage.goto('/admin/catalog/genres')
      const genreName = await createGenre(adminPage)

      await adminPage.goto('/admin/catalog/people')
      const personName = await createPerson(adminPage)

      await adminPage.goto('/admin/catalog/movies')
      await expect(adminPage.locator('h1')).toContainText(/movies/i, { timeout: 10_000 })

      const movieTitle = `e2e-movie-${Date.now().toString()}`
      await adminPage.getByRole('button', { name: /create movie/i }).click()
      await expect(adminPage).toHaveURL(/\/admin\/catalog\/movies\/create/)

      await adminPage.getByLabel(/title/i).fill(movieTitle)
      await adminPage.getByLabel(/description/i).fill('This is a test movie description.')

      // Select genre
      await adminPage.getByRole('button', { name: /select genres/i }).click()
      await adminPage.getByLabel(genreName).check()
      await adminPage.keyboard.press('Escape')

      // Add credit
      await adminPage.getByRole('button', { name: /add credit/i }).click()
      await adminPage.locator('button:has-text("Select person")').click()
      await adminPage.getByRole('option', { name: personName }).click()

      await adminPage.getByRole('button', { name: /save/i }).click()

      await expect(adminPage).toHaveURL(/\/admin\/catalog\/movies/)
      await expect(adminPage.locator('table')).toContainText(movieTitle, { timeout: 10_000 })

      // Edit movie
      await openActionMenu(adminPage, movieTitle)
      await adminPage.getByRole('menuitem', { name: /edit/i }).click()
      await expect(adminPage.locator('h1')).toContainText(/edit movie/i, { timeout: 10_000 })

      const editedTitle = `${movieTitle}-edited`
      await adminPage.getByLabel(/title/i).fill(editedTitle)
      await adminPage.getByRole('button', { name: /save/i }).click()

      await expect(adminPage).toHaveURL(/\/admin\/catalog\/movies/)
      await expect(adminPage.locator('table')).toContainText(editedTitle, { timeout: 10_000 })

      // Delete movie
      adminPage.once('dialog', (dialog) => dialog.accept())
      await openActionMenu(adminPage, editedTitle)
      await adminPage.getByRole('menuitem', { name: /delete/i }).click()
      await expect(adminPage.locator('table')).not.toContainText(editedTitle, { timeout: 5_000 })
    })
  })
})
