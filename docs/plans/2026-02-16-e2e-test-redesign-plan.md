# E2E Test Redesign — Implementation Plan

> **For GEMINI:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the e2e test suite for speed, simplicity, and reliability by consolidating tests, adding custom fixtures, extracting helper functions, and fixing fragile selectors.

**Architecture:** Introduce a `tests/fixtures.ts` with custom Playwright fixtures (`adminPage`/`viewerPage`), extract repeated UI actions into `tests/helpers/actions.helper.ts`, consolidate many small tests into fewer scenario-based tests, and replace CSS-class selectors with `data-testid`.

**Tech Stack:** Playwright, TypeScript

**Design doc:** `docs/plans/2026-02-16-e2e-test-redesign.md`

**Note:** `api.helper.ts` already handles 409 conflicts idempotently — `createUser` and `createRole` catch duplicate errors and fetch existing. No changes needed there.

---

### Task 1: Create Playwright custom fixtures

**Files:**

- Create: `tests/fixtures.ts`

**Step 1: Create the fixtures file**

```ts
// tests/fixtures.ts
import { test as base, type Page } from '@playwright/test'
import { loginViaAPI } from './helpers/auth.helper'
import { ADMIN_USER, VIEWER_USER } from './helpers/fixtures'

export const test = base.extend<{
  adminPage: Page
  viewerPage: Page
}>({
  adminPage: async ({ page }, use) => {
    await loginViaAPI(page, ADMIN_USER.username, ADMIN_USER.password)
    await use(page)
  },
  viewerPage: async ({ page }, use) => {
    await loginViaAPI(page, VIEWER_USER.username, VIEWER_USER.password)
    await use(page)
  },
})

export { expect } from '@playwright/test'
```

**Step 2: Verify it compiles**

Run: `pnpm exec tsc --noEmit --project tsconfig.json` or check for import errors.

**Step 3: Commit**

```
feat(e2e): add custom Playwright fixtures for adminPage/viewerPage
```

---

### Task 2: Create UI action helpers

**Files:**

- Create: `tests/helpers/actions.helper.ts`

**Step 1: Create the actions helper file**

```ts
// tests/helpers/actions.helper.ts
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Open the action menu (three-dot dropdown) for a table row containing the given text.
 */
export async function openActionMenu(page: Page, rowText: string): Promise<void> {
  const row = page.locator('table tbody tr', { hasText: rowText })
  await row.getByRole('button').click()
}

// ── Users ──

/**
 * Create a user via the Create User dialog. Returns the generated username.
 */
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

/**
 * Edit a user's username via the action menu. Returns the new username.
 */
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

/**
 * Disable a user via the action menu and confirm.
 */
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

/**
 * Enable a user via the action menu and confirm.
 */
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

// ── Roles ──

/**
 * Create a role via the Create Role dialog. Returns the generated role name.
 */
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

/**
 * Edit a role's name via the action menu. Returns the new role name.
 */
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

/**
 * Delete a role via the action menu and confirm.
 */
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
```

**Step 2: Commit**

```
feat(e2e): add reusable UI action helpers for users and roles
```

---

### Task 3: Fix fragile selectors

**Files:**

- Modify: `src/app/routes/admin/_authenticated/users.tsx:173` — add `data-testid`

**Step 1: Add data-testid to users search input**

In `src/app/routes/admin/_authenticated/users.tsx`, find the search `<Input>` with `className="pl-9"` and add `data-testid="users-search"`:

```tsx
// Before
className="pl-9"

// After
data-testid="users-search"
className="pl-9"
```

**Step 2: Commit**

```
feat(e2e): add data-testid to users search input
```

---

### Task 4: Consolidate users.spec.ts

**Files:**

- Rewrite: `tests/e2e/users.spec.ts`

This is the reference implementation for the consolidation pattern. All subsequent spec refactors follow this same approach.

**Step 1: Rewrite users.spec.ts**

```ts
import { test, expect } from '../fixtures'
import {
  createUser,
  editUser,
  disableUser,
  enableUser,
  openActionMenu,
} from '../helpers/actions.helper'

test.describe('Users page', () => {
  test('listing, search, and filters', async ({ adminPage }) => {
    await adminPage.goto('/admin/users')
    await expect(adminPage.locator('h1')).toContainText(/user/i, { timeout: 10_000 })
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })

    // Bootstrapped users visible
    await expect(adminPage.locator('table')).toContainText('superadmin', { timeout: 5_000 })
    await expect(adminPage.locator('table')).toContainText('e2e-admin', { timeout: 5_000 })
    await expect(adminPage.locator('table')).toContainText('e2e-viewer', { timeout: 5_000 })

    // Search input and status filter present
    await expect(adminPage.getByTestId('users-search')).toBeVisible()
    await expect(adminPage.locator('button[role="combobox"]')).toBeVisible()

    // Search filters correctly
    const searchInput = adminPage.getByTestId('users-search')
    await searchInput.fill('e2e-admin')
    await adminPage.waitForTimeout(500)
    await expect(adminPage.locator('table')).toContainText('e2e-admin', { timeout: 5_000 })

    // Non-existent user
    await searchInput.clear()
    await searchInput.fill('nonexistentuserxyz')
    await adminPage.waitForTimeout(500)
    await expect(
      adminPage.getByText(/no users found/i).or(adminPage.locator('table tbody tr').first()),
    ).toBeVisible({ timeout: 5_000 })
  })

  test('CRUD lifecycle', async ({ adminPage }) => {
    await adminPage.goto('/admin/users')
    await expect(adminPage.locator('h1')).toContainText(/user/i, { timeout: 10_000 })

    // Create
    const username = await createUser(adminPage)

    // Edit
    const newUsername = await editUser(adminPage, username)

    // Disable
    await disableUser(adminPage, newUsername)
    const row = adminPage.locator('table tbody tr', { hasText: newUsername })
    await expect(row.getByText(/disabled/i)).toBeVisible({ timeout: 5_000 })

    // Enable
    await enableUser(adminPage, newUsername)
    await expect(row.getByText(/^active$/i)).toBeVisible({ timeout: 5_000 })

    // Manage roles dialog
    await openActionMenu(adminPage, 'e2e-admin')
    await adminPage.getByRole('menuitem', { name: /manage roles/i }).click()
    await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
    await expect(adminPage.getByRole('dialog').getByRole('button', { name: /save/i })).toBeVisible()
    await adminPage.keyboard.press('Escape')
    await expect(adminPage.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })

    // Manage permissions dialog
    await openActionMenu(adminPage, 'e2e-admin')
    await adminPage.getByRole('menuitem', { name: /manage permissions/i }).click()
    await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
    await adminPage.keyboard.press('Escape')
    await expect(adminPage.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
  })

  test('form validation', async ({ adminPage }) => {
    await adminPage.goto('/admin/users')
    await expect(adminPage.locator('h1')).toContainText(/user/i, { timeout: 10_000 })

    await adminPage.getByRole('button', { name: /create user/i }).click()
    await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })

    // Submit without filling fields
    await adminPage
      .getByRole('dialog')
      .getByRole('button', { name: /create/i })
      .click()

    // Validation errors
    await expect(
      adminPage
        .getByRole('dialog')
        .getByText(/required/i)
        .first(),
    ).toBeVisible({ timeout: 3_000 })
  })
})
```

**Step 2: Run to verify**

Run: `pnpm exec playwright test tests/e2e/users.spec.ts`
Expected: 3 tests pass

**Step 3: Commit**

```
refactor(e2e): consolidate users tests into scenario-based tests
```

---

### Task 5: Consolidate roles.spec.ts

**Files:**

- Rewrite: `tests/e2e/roles.spec.ts`

**Step 1: Rewrite roles.spec.ts**

```ts
import { test, expect } from '../fixtures'
import { createRole, editRole, deleteRole, openActionMenu } from '../helpers/actions.helper'

test.describe('Roles page', () => {
  test('CRUD lifecycle with permissions', async ({ adminPage }) => {
    await adminPage.goto('/admin/roles')
    await expect(adminPage.locator('h1')).toContainText(/role/i, { timeout: 10_000 })

    // Create
    const roleName = await createRole(adminPage)

    // Edit
    const newRoleName = await editRole(adminPage, roleName)

    // Manage permissions — toggle and save
    await openActionMenu(adminPage, newRoleName)
    await adminPage.getByRole('menuitem', { name: /manage permissions/i }).click()
    await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })
    const checkboxes = adminPage.getByRole('dialog').getByRole('checkbox')
    await expect(checkboxes.first()).toBeVisible()
    await checkboxes.first().click()
    await adminPage.getByRole('dialog').getByRole('button', { name: /save/i }).click()
    await expect(adminPage.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })

    // Delete
    await deleteRole(adminPage, newRoleName)
  })

  test('form validation', async ({ adminPage }) => {
    await adminPage.goto('/admin/roles')
    await expect(adminPage.locator('h1')).toContainText(/role/i, { timeout: 10_000 })

    await adminPage.getByRole('button', { name: /create role/i }).click()
    await expect(adminPage.getByRole('dialog')).toBeVisible({ timeout: 3_000 })

    // Submit without filling name
    await adminPage
      .getByRole('dialog')
      .getByRole('button', { name: /create/i })
      .click()
    await expect(adminPage.getByRole('dialog').getByText(/required/i)).toBeVisible({
      timeout: 3_000,
    })
  })
})
```

**Step 2: Run to verify**

Run: `pnpm exec playwright test tests/e2e/roles.spec.ts`
Expected: 2 tests pass

**Step 3: Commit**

```
refactor(e2e): consolidate roles tests into scenario-based tests
```

---

### Task 6: Consolidate navigation.spec.ts

**Files:**

- Rewrite: `tests/e2e/navigation.spec.ts`

**Step 1: Rewrite navigation.spec.ts**

Consolidate 6 tests (5 sidebar + 1 header) into 2 tests:

```ts
import { test, expect } from '../fixtures'

test.describe('Navigation', () => {
  test('sidebar structure and links', async ({ adminPage }) => {
    await adminPage.goto('/admin')
    await expect(adminPage.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })

    const sidebar = adminPage.locator('[data-sidebar="content"]')

    // Auth group
    await expect(sidebar.getByRole('link', { name: /^users$/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /^roles$/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /^sessions$/i })).toBeVisible()

    // Audit group
    await expect(sidebar.getByRole('link', { name: /action logs/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /status changes/i })).toBeVisible()

    // Platform group
    await expect(sidebar.getByRole('link', { name: /^queues$/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /dead letter/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /task results/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /^schedules$/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /^errors$/i })).toBeVisible()

    // Header, footer, app name
    const sidebarHeader = adminPage.locator('[data-sidebar="header"]')
    await expect(sidebarHeader.getByText(/enterprise blueprint/i)).toBeVisible()
    await expect(adminPage.getByText(new RegExp('e2e-admin'))).toBeVisible()
    await expect(adminPage.getByText(/log out/i)).toBeVisible()
    await expect(adminPage.locator('button[data-sidebar="trigger"]')).toBeVisible()

    // Navigation links work
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

    await adminPage.getByRole('link', { name: /^queues$/i }).click()
    await adminPage.waitForURL(/\/admin\/platform\/queues/, { timeout: 5_000 })
    await expect(adminPage.locator('h1')).toContainText(/queue/i)
  })
})
```

**Step 2: Run to verify**

Run: `pnpm exec playwright test tests/e2e/navigation.spec.ts`
Expected: 1 test passes

**Step 3: Commit**

```
refactor(e2e): consolidate navigation tests into single scenario
```

---

### Task 7: Consolidate dashboard.spec.ts

**Files:**

- Rewrite: `tests/e2e/dashboard.spec.ts`

**Step 1: Rewrite dashboard.spec.ts**

Consolidate 4 tests into 1:

```ts
import { test, expect } from '../fixtures'

test.describe('Dashboard', () => {
  test('displays content, cards, and quick actions', async ({ adminPage }) => {
    await adminPage.goto('/admin')
    await expect(adminPage.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })
    await expect(adminPage.getByText(/welcome/i)).toBeVisible()

    // Summary cards
    const usersCard = adminPage.getByText(/total users/i).locator('..')
    await expect(usersCard).toBeVisible()
    const errorsCard = adminPage.getByText(/error count/i).locator('..')
    await expect(errorsCard).toBeVisible()

    // Quick actions
    await expect(adminPage.getByText(/quick actions/i)).toBeVisible()
    const actionLinks = adminPage
      .getByRole('link')
      .filter({ hasText: /action logs|queues|errors/i })
    await expect(actionLinks.first()).toBeVisible()

    // Quick action link navigates correctly
    const main = adminPage.locator('main main')
    const actionLogsLink = main.getByRole('link', { name: /action logs/i })
    if (await actionLogsLink.isVisible()) {
      await actionLogsLink.click()
      await adminPage.waitForURL(/\/admin\/audit\/action-logs/, { timeout: 5_000 })
      await expect(adminPage.locator('h1')).toContainText(/action logs/i)
    }
  })
})
```

**Step 2: Run to verify**

Run: `pnpm exec playwright test tests/e2e/dashboard.spec.ts`
Expected: 1 test passes

**Step 3: Commit**

```
refactor(e2e): consolidate dashboard tests into single scenario
```

---

### Task 8: Update sessions.spec.ts to use fixtures

**Files:**

- Modify: `tests/e2e/sessions.spec.ts`

**Step 1: Rewrite sessions.spec.ts**

Consolidate 3 tests into 1, use fixtures:

```ts
import { test, expect } from '../fixtures'

test.describe('Sessions page', () => {
  test('tabs, table, and search', async ({ adminPage }) => {
    await adminPage.goto('/admin/sessions')
    await expect(adminPage.locator('h1')).toContainText(/session/i, { timeout: 10_000 })

    // Both tabs visible
    await expect(adminPage.getByRole('tab', { name: /my sessions/i })).toBeVisible()
    await expect(adminPage.getByRole('tab', { name: /all sessions/i })).toBeVisible()

    // My Sessions active by default with table
    await expect(adminPage.getByRole('tab', { name: /my sessions/i })).toHaveAttribute(
      'data-state',
      'active',
    )
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible()
    await expect(adminPage.locator('th', { hasText: /ip address/i })).toBeVisible()

    // All Sessions tab
    await adminPage.getByRole('tab', { name: /all sessions/i }).click()
    await expect(adminPage.getByPlaceholder(/user id/i)).toBeVisible()
    await expect(adminPage.getByRole('button', { name: /search/i })).toBeVisible()
  })
})
```

**Step 2: Run to verify**

Run: `pnpm exec playwright test tests/e2e/sessions.spec.ts`
Expected: 1 test passes

**Step 3: Commit**

```
refactor(e2e): consolidate sessions tests and use fixtures
```

---

### Task 9: Consolidate audit.spec.ts

**Files:**

- Rewrite: `tests/e2e/audit.spec.ts`

**Step 1: Rewrite audit.spec.ts**

Consolidate 6 tests (3 action logs + 3 status changes) into 2:

```ts
import { test, expect } from '../fixtures'

test.describe('Audit pages', () => {
  test('action logs — filters and table', async ({ adminPage }) => {
    await adminPage.goto('/admin/audit/action-logs')
    await expect(adminPage.locator('h1')).toContainText(/action.*log/i, { timeout: 10_000 })

    // Date range inputs
    const dateInputs = adminPage.locator('input[type="datetime-local"]')
    await expect(dateInputs.first()).toBeVisible()
    await expect(dateInputs.nth(1)).toBeVisible()

    // Expand filters
    await adminPage.getByRole('button', { name: /filter/i }).click()
    await expect(adminPage.getByPlaceholder(/module/i)).toBeVisible({ timeout: 3_000 })
    await expect(adminPage.getByPlaceholder(/operation/i)).toBeVisible()
    await expect(adminPage.getByPlaceholder(/user id/i)).toBeVisible()
    await expect(adminPage.getByPlaceholder(/group key/i)).toBeVisible()

    // Table or empty state
    await expect(
      adminPage.locator('table').or(adminPage.getByText(/no action logs found/i)),
    ).toBeVisible({ timeout: 5_000 })
  })

  test('status changes — filters and table', async ({ adminPage }) => {
    await adminPage.goto('/admin/audit/status-changes')
    await expect(adminPage.locator('h1')).toContainText(/status.*change/i, { timeout: 10_000 })

    // Date range inputs
    const dateInputs = adminPage.locator('input[type="datetime-local"]')
    await expect(dateInputs.first()).toBeVisible()

    // Expand filters
    await adminPage.getByRole('button', { name: /filter/i }).click()
    await expect(adminPage.getByPlaceholder(/entity type/i)).toBeVisible({ timeout: 3_000 })
    await expect(adminPage.getByPlaceholder(/entity id/i)).toBeVisible()

    // Table or empty state
    await expect(
      adminPage.locator('table').or(adminPage.getByText(/no status change logs found/i)),
    ).toBeVisible({ timeout: 5_000 })
  })
})
```

**Step 2: Run to verify**

Run: `pnpm exec playwright test tests/e2e/audit.spec.ts`
Expected: 2 tests pass

**Step 3: Commit**

```
refactor(e2e): consolidate audit tests and use fixtures
```

---

### Task 10: Consolidate platform.spec.ts

**Files:**

- Rewrite: `tests/e2e/platform.spec.ts`

**Step 1: Rewrite platform.spec.ts**

Consolidate 10 tests into 5 (one per sub-page):

```ts
import { test, expect } from '../fixtures'

test.describe('Platform pages', () => {
  test('queues — cards and stats', async ({ adminPage }) => {
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

  test('dead letter queue — filters and table', async ({ adminPage }) => {
    await adminPage.goto('/admin/platform/dlq')
    await expect(adminPage.locator('h1')).toContainText(/dead.*letter/i, { timeout: 10_000 })

    await expect(adminPage.locator('button[role="combobox"]')).toBeVisible()
    await expect(adminPage.getByPlaceholder(/operation/i)).toBeVisible()
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible()
    await expect(adminPage.locator('th', { hasText: /queue/i })).toBeVisible()
    await expect(adminPage.locator('th', { hasText: /error/i })).toBeVisible()
  })

  test('task results — filters, table, and cleanup dialog', async ({ adminPage }) => {
    await adminPage.goto('/admin/platform/task-results')
    await expect(adminPage.locator('h1')).toContainText(/task.*result/i, { timeout: 10_000 })

    await expect(adminPage.locator('button[role="combobox"]')).toBeVisible()
    await expect(adminPage.getByPlaceholder(/task group/i)).toBeVisible()
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible()

    // Cleanup dialog
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

  test('schedules — table with seeded data', async ({ adminPage }) => {
    await adminPage.goto('/admin/platform/schedules')
    await expect(adminPage.locator('h1')).toContainText(/schedule/i, { timeout: 10_000 })

    await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
    await expect(adminPage.locator('table tbody tr').first()).toBeVisible()
    await expect(adminPage.locator('table').getByText(/operation/i)).toBeVisible()
    await expect(adminPage.locator('table').getByText(/cron/i)).toBeVisible()
    await expect(adminPage.locator('table').getByText(/next run/i)).toBeVisible()
  })

  test('errors — filters, table, stats, and cleanup dialog', async ({ adminPage }) => {
    await adminPage.goto('/admin/platform/errors')
    await expect(adminPage.locator('h1')).toContainText(/error/i, { timeout: 10_000 })

    // Filters
    await expect(adminPage.getByPlaceholder(/code/i)).toBeVisible()
    await expect(adminPage.getByPlaceholder(/service/i)).toBeVisible()
    await expect(adminPage.getByPlaceholder(/operation/i)).toBeVisible()
    await expect(adminPage.getByPlaceholder(/search/i)).toBeVisible()

    // Table
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 5_000 })
    const rows = adminPage.locator('table tbody tr')
    await expect(rows.first()).toBeVisible()
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(1)

    // Stats
    await expect(adminPage.getByText(/total errors/i)).toBeVisible()
    const dateInputs = adminPage.locator('input[type="datetime-local"]')
    await expect(dateInputs.first()).toBeVisible()

    // Cleanup dialog
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
```

**Step 2: Run to verify**

Run: `pnpm exec playwright test tests/e2e/platform.spec.ts`
Expected: 5 tests pass

**Step 3: Commit**

```
refactor(e2e): consolidate platform tests and use fixtures
```

---

### Task 11: Consolidate settings.spec.ts

**Files:**

- Rewrite: `tests/e2e/settings.spec.ts`

**Step 1: Rewrite settings.spec.ts**

Consolidate 5 tests (2 theme + 2 language + 1 logout) into 3:

```ts
import { test, expect } from '../fixtures'

test.describe('Settings', () => {
  test('theme switcher — toggle dark and light', async ({ adminPage }) => {
    await adminPage.goto('/admin')
    await expect(adminPage.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })

    // Open theme dropdown — options visible
    const themeTrigger = adminPage.getByRole('button', { name: /toggle theme/i })
    await expect(themeTrigger).toBeVisible()
    await themeTrigger.click()
    await expect(adminPage.getByRole('menuitem', { name: /light/i })).toBeVisible()
    await expect(adminPage.getByRole('menuitem', { name: /dark/i })).toBeVisible()
    await expect(adminPage.getByRole('menuitem', { name: /system/i })).toBeVisible()

    // Switch to dark
    await adminPage.getByRole('menuitem', { name: /dark/i }).click()
    await expect(adminPage.locator('html')).toHaveClass(/dark/, { timeout: 3_000 })

    // Switch back to light
    await adminPage.getByRole('button', { name: /toggle theme/i }).click()
    await adminPage.getByRole('menuitem', { name: /light/i }).click()
    await expect(adminPage.locator('html')).not.toHaveClass(/dark/, { timeout: 3_000 })
  })

  test('language switcher — toggle language', async ({ adminPage }) => {
    await adminPage.goto('/admin')
    await expect(adminPage.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })

    // Open language dropdown — options visible
    const langTrigger = adminPage.getByRole('button', { name: /switch language/i })
    await expect(langTrigger).toBeVisible()
    await langTrigger.click()
    await expect(adminPage.getByRole('menuitem', { name: /english/i })).toBeVisible()
    await expect(adminPage.getByRole('menuitem', { name: /русский/i })).toBeVisible()
    await expect(adminPage.getByRole('menuitem', { name: /o'zbekcha/i })).toBeVisible()

    // Switch to Russian
    await adminPage.getByRole('menuitem', { name: /русский/i }).click()
    await expect(adminPage.locator('h1')).not.toContainText(/dashboard/i, { timeout: 3_000 })

    // Switch back to English
    await adminPage.getByRole('button', { name: /язык/i }).click()
    await adminPage.getByRole('menuitem', { name: /english/i }).click()
    await expect(adminPage.locator('h1')).toContainText(/dashboard/i, { timeout: 3_000 })
  })

  test('logout redirects to login', async ({ adminPage }) => {
    await adminPage.goto('/admin')
    await expect(adminPage.locator('h1')).toContainText(/dashboard/i, { timeout: 10_000 })

    await adminPage.getByText(/log out/i).click()
    await adminPage.waitForURL(/\/admin\/login/, { timeout: 10_000 })
    await expect(adminPage.getByLabel(/username/i)).toBeVisible()
  })
})
```

**Step 2: Run to verify**

Run: `pnpm exec playwright test tests/e2e/settings.spec.ts`
Expected: 3 tests pass

**Step 3: Commit**

```
refactor(e2e): consolidate settings tests and use fixtures
```

---

### Task 12: Full suite verification

**Step 1: Run the complete e2e suite**

Run: `pnpm test:e2e`
Expected: All tests pass (auth.spec.ts, welcome.spec.ts, permissions.spec.ts unchanged; all refactored specs pass)

**Step 2: Run it a second time without restart**

Run: `pnpm test:e2e`
Expected: All tests pass again (idempotent setup)

**Step 3: Final commit with any remaining fixes**

If any tests needed adjustment, commit the fixes:

```
fix(e2e): address issues found during full suite verification
```
