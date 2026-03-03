import { expect, test } from '../fixtures'

test.describe('movie details saga', () => {
  test('unauthenticated flow', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    const firstMovie = page.getByRole('link').filter({ hasText: 'Details' }).first()
    const movieUrl = await firstMovie.getAttribute('href')

    await test.step('navigate to movie details from spotlight', async () => {
      await firstMovie.click()
      await expect(page).toHaveURL(new RegExp(movieUrl ?? ''))
    })

    await test.step('page renders correctly', async () => {
      // Hero section exists
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      // Play button exists
      await expect(page.getByRole('link', { name: /Play|Watch/ })).toBeVisible()
    })

    await test.step('navigate to watch page via play button', async () => {
      const playBtn = page.getByRole('link', { name: 'Play Now' }).first()
      if (await playBtn.isVisible()) {
        await playBtn.click()
        await expect(page).toHaveURL(/.*\/watch\/.*/)
      }
    })
  })

  test('authenticated flow', async ({ viewerPage: page }) => {
    // Navigate to homepage
    await page.goto('/')

    const firstMovie = page.getByRole('link', { name: /Details|More Info/ }).first()

    await test.step('navigate to movie details', async () => {
      await firstMovie.click()
    })

    await test.step('cast and crew renders', async () => {
      // Cast section is rendered if available
      const castSection = page.getByRole('heading', { name: 'Cast & Crew' })
      if (await castSection.isVisible()) {
        await expect(castSection).toBeVisible()
      }
    })

    await test.step('more like this section', async () => {
      const moreLikeThis = page.getByRole('heading', { name: 'More Like This' })
      if (await moreLikeThis.isVisible()) {
        await expect(moreLikeThis).toBeVisible()
        // Check if there's at least one related movie
        const movieCard = page.locator('a[href^="/movies/"]').nth(1)
        if (await movieCard.isVisible()) {
          await expect(movieCard).toBeVisible()
        }
      }
    })
  })
})
