import { test, expect } from '../fixtures'

test.describe('Platform pages', () => {
  test('task management saga — queues, DLQ, results, and schedules', async ({ adminPage }) => {
    await test.step('queues — cards with stats', async () => {
      await adminPage.goto('/admin/platform/queues')
      await expect(adminPage.locator('h1')).toContainText(/queue/i, { timeout: 10_000 })

      const main = adminPage.locator('main main')
      await expect(main.getByText(/last updated/i)).toBeVisible()
      await expect(main.getByText('auth')).toBeVisible({ timeout: 5_000 })
      await expect(main.getByText('platform')).toBeVisible()
      await expect(main.getByText(/available/i).first()).toBeVisible({ timeout: 5_000 })
      await expect(main.getByText(/in flight/i).first()).toBeVisible()
      await expect(main.getByText(/in dlq/i).first()).toBeVisible()
    })

    await test.step('queues — purge queue dialog', async () => {
      const purgeQueueBtn = adminPage.getByRole('button', { name: /purge queue/i }).first()
      await expect(purgeQueueBtn).toBeVisible()
      await purgeQueueBtn.click()
      await expect(adminPage.getByRole('alertdialog')).toBeVisible({ timeout: 3_000 })
      await adminPage
        .getByRole('alertdialog')
        .getByRole('button', { name: /cancel/i })
        .click()
      await expect(adminPage.getByRole('alertdialog')).not.toBeVisible({ timeout: 3_000 })
    })

    await test.step('queues — purge DLQ dialog', async () => {
      const purgeDlqBtn = adminPage.getByRole('button', { name: /purge dlq/i }).first()
      await expect(purgeDlqBtn).toBeVisible()
      await purgeDlqBtn.click()
      await expect(adminPage.getByRole('alertdialog')).toBeVisible({ timeout: 3_000 })
      await adminPage.keyboard.press('Escape')
      await expect(adminPage.getByRole('alertdialog')).not.toBeVisible({ timeout: 3_000 })
    })

    await test.step('DLQ — filters and table', async () => {
      await adminPage.goto('/admin/platform/dlq')
      await expect(adminPage.locator('h1')).toContainText(/dead.*letter/i, { timeout: 10_000 })

      await expect(adminPage.locator('button[role="combobox"]')).toBeVisible()
      await expect(adminPage.getByPlaceholder(/operation/i)).toBeVisible()
      await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
      await expect(adminPage.locator('table tbody tr').first()).toBeVisible()
      await expect(adminPage.locator('th', { hasText: /queue/i })).toBeVisible()
      await expect(adminPage.locator('th', { hasText: /error/i })).toBeVisible()
    })

    await test.step('DLQ — expand row and requeue dialog', async () => {
      const firstRow = adminPage.locator('table tbody tr').first()
      await firstRow.click()
      const preElement = adminPage.locator('pre').first()
      await expect(preElement).toBeVisible({ timeout: 3_000 })

      const requeueBtn = adminPage.getByRole('button', { name: /requeue/i }).first()
      await expect(requeueBtn).toBeVisible()
      await requeueBtn.click()
      await expect(adminPage.getByRole('alertdialog')).toBeVisible({ timeout: 3_000 })
      await adminPage
        .getByRole('alertdialog')
        .getByRole('button', { name: /cancel/i })
        .click()
      await expect(adminPage.getByRole('alertdialog')).not.toBeVisible({ timeout: 3_000 })

      // Collapse row
      await firstRow.click()
      await expect(preElement).not.toBeVisible({ timeout: 3_000 })
    })

    await test.step('task results — filters, table, and columns', async () => {
      await adminPage.goto('/admin/platform/task-results')
      await expect(adminPage.locator('h1')).toContainText(/task.*result/i, { timeout: 10_000 })

      await expect(adminPage.locator('button[role="combobox"]')).toBeVisible()
      await expect(adminPage.getByPlaceholder(/task group/i)).toBeVisible()
      await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
      await expect(adminPage.locator('table tbody tr').first()).toBeVisible()
      await expect(adminPage.locator('th', { hasText: /attempts/i })).toBeVisible()
      await expect(adminPage.locator('th', { hasText: /scheduled at/i })).toBeVisible()
      await expect(adminPage.locator('th', { hasText: /completed at/i })).toBeVisible()
    })

    await test.step('task results — cleanup dialog', async () => {
      const cleanupBtn = adminPage.getByRole('button', { name: /cleanup/i })
      await expect(cleanupBtn).toBeVisible()
      await cleanupBtn.click()
      await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
      await expect(
        adminPage.getByRole('dialog').getByRole('heading', { name: /cleanup/i }),
      ).toBeVisible()
      await adminPage.keyboard.press('Escape')
      await expect(adminPage.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
    })

    await test.step('schedules — table with seeded data', async () => {
      await adminPage.goto('/admin/platform/schedules')
      await expect(adminPage.locator('h1')).toContainText(/schedule/i, { timeout: 10_000 })

      await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
      await expect(adminPage.locator('table tbody tr').first()).toBeVisible()
      await expect(adminPage.locator('table').getByText(/operation/i)).toBeVisible()
      await expect(adminPage.locator('table').getByText(/cron/i)).toBeVisible()
      await expect(adminPage.locator('table').getByText(/next run/i)).toBeVisible()
    })
  })

  test('errors management saga — list, detail, and cleanup', async ({ adminPage }) => {
    await test.step('errors — filters and date range', async () => {
      await adminPage.goto('/admin/platform/errors')
      await expect(adminPage.locator('h1')).toContainText(/error/i, { timeout: 10_000 })

      await expect(adminPage.getByPlaceholder(/code/i)).toBeVisible()
      await expect(adminPage.getByPlaceholder(/service/i)).toBeVisible()
      await expect(adminPage.getByPlaceholder(/operation/i)).toBeVisible()
      await expect(adminPage.getByPlaceholder(/search/i)).toBeVisible()
      const dateInputs = adminPage.locator('input[type="datetime-local"]')
      await expect(dateInputs.first()).toBeVisible()
    })

    await test.step('errors — table with multiple rows', async () => {
      await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
      const rows = adminPage.locator('table tbody tr')
      await expect(rows.first()).toBeVisible()
      expect(await rows.count()).toBeGreaterThan(1)
    })

    await test.step('errors — click row navigates to detail page', async () => {
      const firstRow = adminPage.locator('table tbody tr').first()
      await firstRow.click()
      await adminPage.waitForURL(/\/admin\/platform\/errors\//, { timeout: 5_000 })
    })

    await test.step('error detail — metadata and navigation', async () => {
      const backBtn = adminPage.getByRole('link', { name: /back/i })
      await expect(backBtn).toBeVisible({ timeout: 5_000 })
      await expect(adminPage.locator('h1')).toBeVisible()

      const main = adminPage.locator('main')
      await expect(main.getByText(/service/i).first()).toBeVisible({ timeout: 5_000 })
      await expect(main.getByText(/operation/i).first()).toBeVisible()
      await expect(main.getByText(/created/i).first()).toBeVisible()
      await expect(main.getByText(/alerted/i).first()).toBeVisible()
      await expect(adminPage.locator('code').first()).toBeVisible()
    })

    await test.step('navigate back to errors list', async () => {
      await adminPage.getByRole('link', { name: /back/i }).click()
      await adminPage.waitForURL(/\/admin\/platform\/errors$/, { timeout: 5_000 })
      await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
    })

    await test.step('errors — cleanup dialog', async () => {
      const cleanupBtn = adminPage.getByRole('button', { name: /cleanup/i })
      await expect(cleanupBtn).toBeVisible()
      await cleanupBtn.click()
      await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
      await expect(
        adminPage.getByRole('dialog').locator('input[type="datetime-local"]'),
      ).toBeVisible()
      await adminPage.keyboard.press('Escape')
      await expect(adminPage.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
    })
  })
})
