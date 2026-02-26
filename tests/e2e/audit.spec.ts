import { test, expect } from '../fixtures'

test.describe('Audit pages', () => {
  test('full audit saga — action logs and status changes', async ({ adminPage }) => {
    await test.step('action logs — page renders with date range', async () => {
      await adminPage.goto('/admin/audit/action-logs')
      await expect(adminPage.locator('h1')).toContainText(/action.*log/i, { timeout: 10_000 })

      const dateInputs = adminPage.locator('input[type="datetime-local"]')
      await expect(dateInputs.first()).toBeVisible()
      await expect(dateInputs.nth(1)).toBeVisible()
    })

    await test.step('action logs — table renders (may take time for logs to appear)', async () => {
      // Action logs are written asynchronously — give extra time
      const table = adminPage.locator('table')
      const emptyState = adminPage.getByText(/no action logs found/i)
      await expect(table.or(emptyState)).toBeVisible({ timeout: 10_000 })

      // If table is visible and has rows, test expand/collapse
      if (await table.isVisible()) {
        const rows = adminPage.locator('table tbody tr')
        const rowCount = await rows.count()
        if (rowCount > 0) {
          // Expand first row — request payload visible
          await rows.first().click()
          const expandedPre = adminPage.locator('td.bg-muted\\/50 pre')
          await expect(expandedPre).toBeVisible({ timeout: 3_000 })

          // Collapse first row
          await rows.first().click()
          await expect(expandedPre).not.toBeVisible({ timeout: 3_000 })
        }
      }
    })

    await test.step('action logs — expand filters reveals all filter inputs', async () => {
      await adminPage.getByRole('button', { name: /filter/i }).click()
      await expect(adminPage.getByPlaceholder(/module/i)).toBeVisible({ timeout: 3_000 })
      await expect(adminPage.getByPlaceholder(/operation/i)).toBeVisible()
      await expect(adminPage.getByPlaceholder(/user id/i)).toBeVisible()
      await expect(adminPage.getByPlaceholder(/group key/i)).toBeVisible()
    })

    await test.step('status changes — page renders with date range', async () => {
      await adminPage.goto('/admin/audit/status-changes')
      await expect(adminPage.locator('h1')).toContainText(/status.*change/i, { timeout: 10_000 })

      const dateInputs = adminPage.locator('input[type="datetime-local"]')
      await expect(dateInputs.first()).toBeVisible()
    })

    await test.step('status changes — expand filters', async () => {
      await adminPage.getByRole('button', { name: /filter/i }).click()
      await expect(adminPage.getByPlaceholder(/entity type/i)).toBeVisible({ timeout: 3_000 })
      await expect(adminPage.getByPlaceholder(/entity id/i)).toBeVisible()
    })

    await test.step('status changes — table with expected columns and links', async () => {
      await expect(
        adminPage.locator('table').or(adminPage.getByText(/no status change logs found/i)),
      ).toBeVisible({ timeout: 5_000 })

      const table = adminPage.locator('table')
      if (await table.isVisible()) {
        const rows = adminPage.locator('table tbody tr')
        const rowCount = await rows.count()

        if (rowCount > 0) {
          const headers = adminPage.locator('table thead th')
          await expect(headers.filter({ hasText: /entity type/i })).toBeVisible()
          await expect(headers.filter({ hasText: /entity id/i })).toBeVisible()
          await expect(headers.filter({ hasText: /status/i })).toBeVisible()

          // Action log ID link
          const firstRowLink = rows.first().locator('a[href*="/admin/audit/action-logs"]')
          await expect(firstRowLink).toBeVisible()
        }
      }
    })
  })
})
