# E2E Test Redesign

## Context

The current e2e test suite has 11 spec files covering auth, navigation, dashboard, users, roles, sessions, audit, platform, settings, welcome, and permissions. It works but has scalability concerns:

- **Speed** — Many small tests each repeat login + page navigation (e.g., `users.spec.ts` has 9 tests = 9 logins)
- **Simplicity** — Writing new feature tests requires understanding scattered helpers, manual `beforeEach` blocks, and raw selectors
- **Reliability** — A few CSS-class-based selectors break when styles change; re-running without backend restart can fail

## Decisions

- **No DB reset needed** — Tests use unique names (`Date.now()`) and non-exact assertions (`>= N`, `toContainText`). No test depends on exact DB state.
- **Keep sequential execution** — `workers: 1` stays. Simpler, predictable, fast enough.
- **No page object model** — Too much ceremony for the project size. Helper functions + custom fixtures cover the need.
- **Backend provides superadmin** — `prepare-e2e.sh` starts infra + backend, which seeds superadmin. Frontend only creates test users.

## Changes

### 1. Test Consolidation

Consolidate many small tests into fewer scenario-based tests per feature. Each test walks through a complete flow instead of testing one assertion.

**Before — users.spec.ts (9 tests, 9 logins):**

```
test('displays users table')
test('search input present')
test('search filters users')
test('create user via dialog')
test('edit user')
test('disable and enable user')
test('manage roles dialog')
test('manage permissions dialog')
test('validation error')
```

**After — users.spec.ts (3 tests, 3 logins):**

```
test('user listing and search')
  → table renders with bootstrapped users
  → search filters correctly
  → status filter is present

test('user CRUD lifecycle')
  → create user → appears in table
  → edit user → updated name appears
  → disable → badge changes → enable → badge reverts
  → manage roles dialog opens
  → manage permissions dialog opens

test('user form validation')
  → empty username shows error
  → empty password shows error
```

**Apply this pattern to:** `roles.spec.ts`, `dashboard.spec.ts`, `navigation.spec.ts`, `platform.spec.ts`, `settings.spec.ts`.

**Leave as-is:** `auth.spec.ts`, `welcome.spec.ts`, `permissions.spec.ts` — already have distinct logical groupings.

### 2. Playwright Custom Fixtures

Create a central `tests/fixtures.ts` that exports custom `test` with pre-authenticated pages.

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

**Usage in specs:**

```ts
// Before
import { test, expect } from '@playwright/test'
import { loginViaAPI } from '../helpers/auth.helper'
import { ADMIN_USER } from '../helpers/fixtures'

test.beforeEach(async ({ page }) => {
  await loginViaAPI(page, ADMIN_USER.username, ADMIN_USER.password)
})

test('displays users table', async ({ page }) => { ... })

// After
import { test, expect } from '../fixtures'

test('displays users table', async ({ adminPage }) => { ... })
```

Specs that don't need login (auth.spec.ts, welcome.spec.ts) keep importing from `@playwright/test` directly.

### 3. Helper Functions

Extract repeated multi-step UI actions into `tests/helpers/actions.helper.ts`.

**Functions to extract (used 2+ times):**

```ts
// tests/helpers/actions.helper.ts

// Users
export async function createUser(page: Page, name?: string): Promise<string>
export async function editUser(page: Page, currentName: string, newName?: string): Promise<string>
export async function disableUser(page: Page, username: string): Promise<void>
export async function enableUser(page: Page, username: string): Promise<void>

// Roles
export async function createRole(page: Page, name?: string): Promise<string>
export async function editRole(page: Page, currentName: string, newName?: string): Promise<string>
export async function deleteRole(page: Page, roleName: string): Promise<void>

// Shared
export async function openActionMenu(page: Page, rowText: string): Promise<void>
```

**Tests become readable:**

```ts
test('user CRUD lifecycle', async ({ adminPage }) => {
  await adminPage.goto('/admin/users')

  const username = await createUser(adminPage)
  await expect(adminPage.locator('table')).toContainText(username)

  const newName = await editUser(adminPage, username)
  await expect(adminPage.locator('table')).toContainText(newName)

  await disableUser(adminPage, newName)
  await expect(adminPage.getByText(/disabled/i)).toBeVisible()
})
```

### 4. Fix Fragile Selectors

Replace CSS-class-based selectors with `data-testid` attributes.

**Frontend changes:**

Add `data-testid` to components that lack semantic selectors:

```tsx
// Search inputs without associated labels
<Input data-testid="users-search" ... />
<Input data-testid="action-logs-search" ... />
```

**Test changes:**

```ts
// Before
const searchInput = page.locator('input[class*="pl-9"]')

// After
const searchInput = page.getByTestId('users-search')
```

**Selector preference (unchanged):**

| Selector      | When                                 |
| ------------- | ------------------------------------ |
| `getByRole`   | Buttons, links, headings             |
| `getByLabel`  | Form inputs with labels              |
| `getByText`   | Visible text content                 |
| `getByTestId` | Only when no semantic selector works |

Scope: ~2-3 selectors need `data-testid`. Most tests already use accessible selectors.

### 5. Idempotent Setup

Make `auth.setup.ts` handle re-runs gracefully — no failure if test users already exist.

```ts
// tests/helpers/api.helper.ts — updated bootstrapUserWithPermissions

export async function bootstrapUserWithPermissions(
  token: string,
  username: string,
  password: string,
  permissions: string[],
): Promise<{ userId: string; roleId: number }> {
  // Create user — if already exists, fetch existing
  let userId: string
  try {
    const result = await createUser(token, { username, password })
    userId = result.id
  } catch {
    const users = await getUsers(token, username)
    userId = users[0].id
  }

  // Always re-apply permissions (idempotent)
  const roleId = await findOrCreateRole(token, `${username}-role`)
  await setRolePermissions(token, roleId, permissions)
  await setUserRoles(token, userId, [roleId])

  return { userId, roleId }
}
```

## File Structure After Changes

```
tests/
  fixtures.ts                    ← NEW: custom test with adminPage/viewerPage
  helpers/
    api.helper.ts                ← MODIFIED: idempotent bootstrapping
    auth.helper.ts               ← UNCHANGED
    fixtures.ts                  ← UNCHANGED
    actions.helper.ts            ← NEW: reusable UI action functions
  e2e/
    auth.setup.ts                ← UNCHANGED
    auth.spec.ts                 ← UNCHANGED
    welcome.spec.ts              ← UNCHANGED
    permissions.spec.ts          ← UNCHANGED
    navigation.spec.ts           ← MODIFIED: consolidated + use fixtures
    dashboard.spec.ts            ← MODIFIED: consolidated + use fixtures
    users.spec.ts                ← MODIFIED: consolidated + use fixtures + use actions
    roles.spec.ts                ← MODIFIED: consolidated + use fixtures + use actions
    sessions.spec.ts             ← MODIFIED: use fixtures
    audit.spec.ts                ← MODIFIED: consolidated + use fixtures
    platform.spec.ts             ← MODIFIED: consolidated + use fixtures
    settings.spec.ts             ← MODIFIED: consolidated + use fixtures
```

## Impact

| Metric                          | Before                    | After            |
| ------------------------------- | ------------------------- | ---------------- |
| Total tests                     | ~45                       | ~25              |
| Logins per suite                | ~40                       | ~25              |
| Lines to add a new feature test | ~80 (boilerplate + logic) | ~30 (logic only) |
| Fragile selectors               | 2-3                       | 0                |
| Re-run reliability              | Fails on duplicate users  | Works every time |
