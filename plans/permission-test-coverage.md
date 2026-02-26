# Plan: Permission Handling Test Coverage

## Goal

Close the gaps identified in the permission-handling test review. Every route guard, sidebar filter, and conditional UI element should be tested for both **admin** (full access) and **viewer** (read-only) personas.

---

## Phase 1 — Unit Tests

### 1.1 `src/app/routes/admin/_authenticated/route-guards.test.ts`

Test `requirePermission`:

- **Throws redirect** when the store has no matching permission
  - Set store permissions to `['auth:user:read']`, call `requirePermission(PERMISSIONS.ROLE_READ)` → expect it to throw a redirect to `/admin`
- **Does not throw** when permission is present
  - Set store permissions to `['auth:user:read']`, call `requirePermission(PERMISSIONS.USER_READ)` → expect no error
- **Throws when permissions are empty**
  - Ensure `permissions: []` → any `requirePermission()` throws

Note: The function throws `redirect()` from TanStack Router. Test by catching the thrown value and asserting `redirect.to === '/admin'`. Reset the auth store in `beforeEach`.

### 1.2 `src/features/auth/utils/bootstrap-permissions.test.ts`

Test `bootstrapPermissions` by mocking the 4 API functions (`getUsers`, `getUserPermissions`, `getUserRoles`, `getRolePermissions`):

- **Merges direct + role permissions**: Mock user with direct perms `['a']` and one role with perms `['b']` → result `['a', 'b']`
- **Deduplicates**: Direct perms `['a', 'b']`, role perms `['b', 'c']` → result `['a', 'b', 'c']`
- **User not found**: `getUsers` returns `[]` → result `{ userId: '', permissions: [] }`
- **API failure (catch branch)**: `getUsers` throws → result `{ userId: '', permissions: [] }`
- **Multiple roles**: Two roles with overlapping perms → deduped correctly

---

## Phase 2 — E2E: Viewer Permission Tests

### 2.1 New file: `tests/e2e/permissions.spec.ts`

All tests log in as `VIEWER_USER` via `loginViaAPI`. The viewer has these permissions (read-only):

```
auth:user:read, auth:role:read, auth:access:read, auth:session:read,
audit:action-log:read, audit:status-change-log:read,
taskmill:view, alert:view
```

The viewer **lacks** all `*:manage` permissions:

```
auth:user:manage, auth:role:manage, auth:access:manage, auth:session:manage,
taskmill:manage, alert:manage
```

#### 2.1.1 Route guard redirect tests

Verify that the viewer can access routes guarded by permissions they have, and for routes requiring manage permissions (which are guarded by read permissions at the route level), they can view the page but not see manage actions.

Since all `requirePermission` guards use read/view permissions, the viewer CAN access every route. The key tests are about **UI elements being hidden**:

| Route                          | Guard permission         | Viewer has it? |
| ------------------------------ | ------------------------ | -------------- |
| `/admin/users`                 | `USER_READ`              | Yes            |
| `/admin/roles`                 | `ROLE_READ`              | Yes            |
| `/admin/sessions`              | None                     | Yes (no guard) |
| `/admin/audit/action-logs`     | `ACTION_LOG_READ`        | Yes            |
| `/admin/audit/status-changes`  | `STATUS_CHANGE_LOG_READ` | Yes            |
| `/admin/platform/queues`       | `TASKMILL_VIEW`          | Yes            |
| `/admin/platform/dlq`          | `TASKMILL_VIEW`          | Yes            |
| `/admin/platform/task-results` | `TASKMILL_VIEW`          | Yes            |
| `/admin/platform/schedules`    | `TASKMILL_VIEW`          | Yes            |
| `/admin/platform/errors`       | `ALERT_VIEW`             | Yes            |
| `/admin/platform/error-stats`  | `ALERT_VIEW`             | Yes            |

**Additional test with a custom restricted user:** Create a test that injects localStorage with a minimal permission set (e.g., only `['auth:user:read']`) and verifies that navigating to `/admin/platform/queues` (requires `TASKMILL_VIEW`) redirects back to `/admin`. This tests the `requirePermission` route guard.

```
describe('Route guards with minimal permissions')
  - Inject auth-storage with only ['auth:user:read']
  - Navigate to /admin/platform/queues → expect redirect to /admin
  - Navigate to /admin/audit/action-logs → expect redirect to /admin
  - Navigate to /admin/platform/errors → expect redirect to /admin
  - Navigate to /admin/roles → expect redirect to /admin
  - Navigate to /admin/users → expect page loads (has USER_READ)
```

#### 2.1.2 Sidebar visibility tests (viewer)

```
describe('Sidebar shows only permitted links for viewer')
  - Login as VIEWER_USER
  - Dashboard link: visible (no permission)
  - Users link: visible (has USER_READ)
  - Roles link: visible (has ROLE_READ)
  - Sessions link: visible (no permission on sidebar item)
  - Action Logs: visible (has ACTION_LOG_READ)
  - Status Changes: visible (has STATUS_CHANGE_LOG_READ)
  - Queues, DLQ, Task Results, Schedules: visible (has TASKMILL_VIEW)
  - Errors, Error Stats: visible (has ALERT_VIEW)
```

```
describe('Sidebar hides links for minimal-permission user')
  - Inject auth-storage with only ['auth:user:read']
  - Users link: visible
  - Roles link: NOT visible (no ROLE_READ)
  - Action Logs: NOT visible (no ACTION_LOG_READ)
  - Status Changes: NOT visible
  - Queues, DLQ, Task Results, Schedules: NOT visible
  - Errors, Error Stats: NOT visible
  - Sessions link: still visible (no permission gate)
  - Dashboard link: still visible (no permission gate)
```

#### 2.1.3 Manage button visibility tests (viewer)

```
describe('Viewer cannot see manage actions')
  test('Users page — no Create User button')
    - Login as VIEWER_USER, go to /admin/users
    - expect(page.getByRole('button', { name: /create user/i })).not.toBeVisible()
    - Open row dropdown for e2e-viewer → expect no "Edit User", "Disable User", "Manage Roles", "Manage Permissions" menu items

  test('Roles page — no Create Role button')
    - Go to /admin/roles
    - expect(page.getByRole('button', { name: /create role/i })).not.toBeVisible()
    - Row dropdown → no "Edit Role", "Delete Role", "Manage Permissions" items

  test('Sessions page — All Sessions tab respects permissions')
    - Go to /admin/sessions
    - Viewer has SESSION_READ, so "All Sessions" tab should be visible
    - But no "Revoke" / manage actions should appear

  test('Queues page — no pause/resume buttons')
    - Go to /admin/platform/queues
    - expect no "Pause" or "Resume" buttons

  test('DLQ page — no retry/delete buttons')
    - Go to /admin/platform/dlq
    - expect no "Retry" or "Delete" action buttons

  test('Task Results page — no Cleanup button')
    - Go to /admin/platform/task-results
    - expect(page.getByRole('button', { name: /cleanup/i })).not.toBeVisible()

  test('Errors page — no Cleanup button')
    - Go to /admin/platform/errors
    - expect(page.getByRole('button', { name: /cleanup/i })).not.toBeVisible()

  test('Schedules page — no manage actions')
    - Go to /admin/platform/schedules
    - expect no "Pause", "Resume", or "Delete" buttons
```

#### 2.1.4 Dashboard conditional cards (viewer)

```
describe('Dashboard renders cards based on permissions')
  test('Viewer sees all cards (has all read/view permissions)')
    - Login as VIEWER_USER, go to /admin
    - Total Users card: visible (has USER_READ)
    - Error Count card: visible (has ALERT_VIEW)

  test('Minimal user sees only permitted cards')
    - Inject auth-storage with only ['auth:user:read']
    - Total Users card: visible
    - Error Count card: NOT visible (no ALERT_VIEW)
    - Quick actions: only shows links for permitted pages
```

---

## Phase 3 — Permission Persistence Test

### 3.1 Add to `tests/e2e/permissions.spec.ts`

```
describe('Permission persistence')
  test('permissions survive page refresh')
    - Login as VIEWER_USER via loginViaAPI
    - Navigate to /admin, verify dashboard loads
    - page.reload()
    - Verify still on /admin (not redirected to login)
    - Verify sidebar still shows expected links
    - Verify auth-storage in localStorage still has permissions array
```

---

## Phase 4 — Sessions Route Decision

The `/admin/sessions` route has **no `requirePermission` guard** in its `beforeLoad`. It conditionally renders the "All Sessions" tab only if the user has `SESSION_READ`.

**Options:**

1. **Add guard** — Add `requirePermission(PERMISSIONS.SESSION_READ)` to sessions route. This would block users without `SESSION_READ` entirely. Downside: "My Sessions" (viewing your own sessions) seems like it should be available to any authenticated user.
2. **Keep as-is, document** — "My Sessions" is available to all authenticated users; "All Sessions" tab requires `SESSION_READ`. Add a comment in the route file documenting this decision.

**Recommendation:** Option 2 — keep as-is and add a test confirming a user without `SESSION_READ` can see "My Sessions" but not the "All Sessions" tab.

```
test('user without SESSION_READ sees only My Sessions tab')
  - Inject auth-storage with permissions that exclude SESSION_READ
  - Navigate to /admin/sessions
  - expect "My Sessions" tab to be active
  - expect "All Sessions" tab to NOT be visible (or disabled)
```

---

## File Summary

| File                                                       | Type | Status                                    |
| ---------------------------------------------------------- | ---- | ----------------------------------------- |
| `src/app/routes/admin/_authenticated/route-guards.test.ts` | Unit | New                                       |
| `src/features/auth/utils/bootstrap-permissions.test.ts`    | Unit | New                                       |
| `tests/e2e/permissions.spec.ts`                            | E2E  | New                                       |
| `src/app/routes/admin/_authenticated/sessions.tsx`         | Code | Add comment documenting no-guard decision |

## Execution Order

1. Phase 1 (unit tests) — can be done in parallel, no dependencies
2. Phase 2 (E2E) — depends on backend running, uses existing `auth.setup.ts` bootstrap
3. Phase 3 (persistence) — add to the same E2E file from Phase 2
4. Phase 4 (sessions decision) — small code comment + one extra test case in Phase 2 file
