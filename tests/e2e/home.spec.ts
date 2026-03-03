import { test, expect } from '../fixtures'

test.describe('Home Page', () => {
  test('home page layout and sections saga', async ({ page }) => {
    await test.step('displays hero spotlight', async () => {
      await page.goto('/')
      // Either we see the spotlight or the empty state
      const spotlight = page.locator('main').getByText(/trending/i)
      const emptyState = page.getByText(/catalog is empty/i)
      
      await expect(spotlight.or(emptyState)).toBeVisible({ timeout: 15_000 })
    })

    await test.step('header contains logo and navigation', async () => {
      const header = page.locator('header')
      await expect(header.getByText(/ANIME/i)).toBeVisible()
      await expect(header.getByText(/WATCH/i)).toBeVisible()
      await expect(header.getByRole('link', { name: /home/i })).toBeVisible()
    })

    await test.step('sidebar displays top 10 and genres', async () => {
      const main = page.locator('main')
      const sidebar = main.locator('aside')
      
      // Only check if not in empty state
      const isEmpty = await page.getByText(/catalog is empty/i).isVisible()
      if (!isEmpty) {
        await expect(sidebar.getByText(/top 10/i)).toBeVisible()
        await expect(sidebar.getByText(/genres/i)).toBeVisible()
      }
    })

    await test.step('footer contains platform information', async () => {
      const footer = page.locator('footer')
      await expect(footer.getByText(/platform/i)).toBeVisible()
      await expect(footer.getByText(/support/i)).toBeVisible()
      await expect(footer.getByText(/account/i)).toBeVisible()
    })
  })
})
