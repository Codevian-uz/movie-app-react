---
name: frontend-guidelines
description: Use when implementing, reviewing, planning, or modifying any frontend code in react-enterprise-blueprint. Load before writing components, routes, API calls, forms, tests, or state management code.
---

# Frontend Guidelines

Project-specific rules. Follow strictly. For UI aesthetics (glass styles, spacing, typography), see `aesthetics.md` in this directory.

## Tech Stack

| Layer           | Technology                              |
| --------------- | --------------------------------------- |
| Framework       | React 19 + TypeScript 5                 |
| Build           | Vite                                    |
| Routing         | TanStack Router (type-safe, file-based) |
| Server State    | TanStack Query                          |
| Client State    | Zustand                                 |
| Forms           | React Hook Form + Zod                   |
| Styling         | Tailwind CSS 4 + shadcn/ui              |
| Unit Tests      | Vitest + React Testing Library          |
| E2E Tests       | Playwright                              |
| Linting         | ESLint + Prettier                       |
| Package Manager | pnpm                                    |

## Project Structure

```
src/
├── app/              # Routes, providers, layouts
├── components/       # Shared components (ui/, layout/, feedback/)
├── config/           # Environment configuration
├── features/         # Feature modules
├── hooks/            # Shared custom hooks
├── lib/              # Pre-configured libraries (api-client, query-client, i18n)
├── stores/           # Global Zustand stores
├── testing/          # Test utilities and mocks
├── types/            # Shared TypeScript types
└── utils/            # Shared utilities
tests/
└── e2e/              # Playwright E2E tests
```

## Architecture

- Layered dependency flow: `shared -> features -> app`
- Features NEVER import from other features
- Cross-feature communication: shared stores, query invalidation, app-layer composition, or URL state
- Each feature exposes a barrel `index.ts` — the only external import point
- Only create directories that are needed

## Naming

- Feature names: kebab-case matching backend module names
- File suffixes: `.api.ts`, `.queries.ts`, `.store.ts`, `.types.ts`, `.utils.ts`
- Components: `PascalCase.tsx` — Tests: `PascalCase.test.tsx` — E2E: `kebab-case.spec.ts`
- Named exports only — no default exports
- `@/` path alias for shared imports, relative paths within a feature

## State Management

- API data -> TanStack Query (never store in Zustand)
- Global client state (auth, sidebar, theme) -> Zustand
- URL state (filters, pagination, tabs) -> TanStack Router search params
- Use `queryOptions()` for queries
- Always invalidate related queries after mutations

## API Conventions

Backend: go-enterprise-blueprint. Base URL in `src/config/env.ts`.

- **GET/POST only** — no PUT, PATCH, DELETE
- URL pattern: `/api/v1/{module}/{operation-id}`
- General API specs: `{backend}/docs/specs/api/general.md`
- Operation specs: `{backend}/docs/specs/modules/{module}/usecases/{domain}/{operation-id}.md`
- Function names match backend operation ID: `admin-login` -> `adminLogin`

## Error Handling

- Network errors (`ApiException.isNetworkError`) -> show `common.errors.networkError` i18n message
- Backend errors -> display `error.message` directly (already translated by backend)
- After `error.message`, show `error.traceId` (if non-empty) in small mono text
- Error boundaries: Root -> Layout -> Feature

## Forms

- Zod schema MUST mirror backend validation rules exactly — check the backend use case spec (`{backend}/docs/specs/modules/{module}/usecases/{domain}/{operation-id}.md`) for every field's constraints (required, min, max, pattern) and replicate them in the Zod schema. Never use just `.min(1)` as a placeholder when the backend enforces stricter rules (e.g., `min=8` for passwords, `min=3, max=50` for usernames)
- `error.fields` -> mark fields invalid via `form.setError(field, { type: 'server' })` with empty message (red border only — backend field messages aren't translated)
- Show `error.message` as form-level alert at top — the only user-visible error text
- Use `mutateAsync` (not `mutate`) in submission handlers

## Routing

- Auth check in `_authenticated` layout route `beforeLoad`, not individual pages
- Validate search params with Zod at route level
- Pages are thin orchestrators — compose feature components, pass route data as props

## UI & Components

- Use shadcn/ui components via `mcp__shadcn__*` MCP tools — never guess APIs
- All user-facing text goes through i18n — keys: `{feature}.{page}.{key}` or `common.{category}.{key}`
- **Cursor pointer**: Tailwind v4 does NOT set `cursor: pointer` on `<button>` elements by default. A global rule in `app.css` handles native buttons. When creating custom clickable elements (divs/spans with `onClick`, table rows), always add `cursor-pointer` explicitly

## Testing

Every feature MUST have both unit tests AND e2e tests — even if the task prompt does not explicitly ask for them. No code is considered complete without corresponding tests. When you change a page or feature, update the corresponding e2e spec too.

- Shared code -> unit/component tests (Vitest + RTL)
- Feature pages/flows -> E2E tests (primary), component tests only for complex isolated logic
- Tests are NOT optional — treat them as a mandatory deliverable for every task, never as an afterthought
- **Never skip e2e tests for any reason** — "backend not running", "too complex", "just a small change" are not valid excuses

### E2E Philosophy: User Journeys, Not Unit Tests

E2E tests follow the **saga pattern** — each test walks through a complete user journey, not isolated assertions.

**Core principles:**

1. **One saga per feature area.** A single test covers validation -> success -> CRUD -> filters -> search -> dialogs -> empty states. Use `test.step()` for granular failure reporting within the saga.
2. **Think like a user, not a developer.** The test walks through the UI the way a real user would — fill a form, submit, see the result, edit it, filter the list, etc.
3. **One login per test.** Authenticate once at the start, then exercise the full flow. Never log in/out repeatedly within a test.
4. **Cover every edge case.** Every input validation field, every filter, every search, every sort, every dialog, every empty state. If the UI has it, the saga tests it.
5. **Fail fast with descriptive steps.** `test.step('creates user with valid data')` tells you exactly what broke without reading the full test.

**Saga structure example:**

```typescript
test('user management saga', async ({ adminPage }) => {
  await test.step('table renders with data', async () => {
    /* ... */
  })
  await test.step('search filters results', async () => {
    /* ... */
  })
  await test.step('empty state on no results', async () => {
    /* ... */
  })
  await test.step('create — validation errors', async () => {
    /* ... */
  })
  await test.step('create — success', async () => {
    /* ... */
  })
  await test.step('edit user', async () => {
    /* ... */
  })
  await test.step('disable user', async () => {
    /* ... */
  })
  await test.step('manage roles dialog', async () => {
    /* ... */
  })
})
```

**What every saga should cover:**

- Table rendering (columns, data, pagination)
- Search/filter functionality (apply, clear, empty state)
- Form validation (every field constraint — not just "required", but min/max/pattern)
- CRUD operations (create, read, update, disable/enable/delete)
- Dialog interactions (open, confirm, cancel)
- Permission-gated UI (buttons hidden for viewers, visible for admins)

## E2E Environment

E2E tests run against a real Go backend. `./scripts/prepare-e2e.sh` clones the backend into `tmp/backend/`, starts full infrastructure (Postgres, Redis via Docker). Set `BACKEND_REF` to pin a version.

### Test Infrastructure

**Centralized bootstrapping** — All test users are pre-created in `tests/e2e/auth.setup.ts` with a single superadmin session. This runs once before all tests:

| User Pattern        | Credentials     | Permissions     | Purpose                           |
| ------------------- | --------------- | --------------- | --------------------------------- |
| `e2e-admin`         | `E2eAdmin123!`  | All permissions | Named admin for auth.spec.ts      |
| `e2e-viewer`        | `E2eViewer123!` | Read-only       | Named viewer for auth.spec.ts     |
| `pw-admin-w{0..N}`  | `E2eAdmin123!`  | All permissions | Per-worker admin (parallel-safe)  |
| `pw-viewer-w{0..N}` | `E2eViewer123!` | Read-only       | Per-worker viewer (parallel-safe) |

**Per-worker user isolation** — Each Playwright worker gets its own admin/viewer user via `tests/fixtures.ts`. Worker fixtures are pure credential providers with zero API calls — no session contention, no race conditions.

**Why this matters:** The backend enforces session limits per user. If multiple workers log in as the same user simultaneously, they hit 500 errors. Per-worker isolation makes tests fully deterministic.

Seeded superadmin:

| Field    | Value           |
| -------- | --------------- |
| Username | `superadmin`    |
| Password | `superadmin123` |

> Superadmin token is **only for bootstrapping** in `auth.setup.ts`. Never use it in actual tests. Create users with appropriate roles, then test as those users to verify real authorization behavior.

### Key Files

| File                           | Purpose                                                |
| ------------------------------ | ------------------------------------------------------ |
| `tests/e2e/auth.setup.ts`      | Bootstraps all test users (runs once before all tests) |
| `tests/fixtures.ts`            | Worker fixtures — provides per-worker credentials      |
| `tests/helpers/fixtures.ts`    | User constants, permission sets, MAX_WORKERS           |
| `tests/helpers/auth.helper.ts` | `loginViaAPI()` — authenticates via API, sets storage  |
| `tests/helpers/api.helper.ts`  | `superadminLogin()`, `bootstrapUserWithPermissions()`  |

### Parallel Execution

Tests are split into two Playwright projects:

- **`parallel`** — Read-only tests that run concurrently (auth, permissions, sessions, audit, platform, app-shell)
- **`mutating`** — Tests that create/modify shared data, run with `workers: 1` (users, roles)

Worker count: 9 locally, 4 in CI. `MAX_WORKERS = 12` pre-creates enough users for any configuration.

### Fake-Token Tests

Tests using fake tokens (route guards, minimal user) **must** intercept API calls to prevent 401 -> clearAuth -> redirect race conditions:

```typescript
await page.route('**/api/**', (route) => route.fulfill({ status: 200, body: '{"content":[]}' }))
```

## Verification

```bash
pnpm verify                                               # Fast: tsc + ESLint + Prettier + Vitest
pnpm verify && ./scripts/prepare-e2e.sh && pnpm test:e2e  # Full: includes Playwright
```

- Run verification via background Task (model: haiku) to avoid context bloat
- If fast loop fails, fix immediately — do not proceed
- Always run full verification (including e2e) at the end of every task — `prepare-e2e.sh` starts the backend automatically, so "backend not running" is never a valid excuse to skip e2e

## Common Mistakes

- Storing API data in Zustand instead of TanStack Query
- Using PUT/PATCH/DELETE (backend only supports GET/POST)
- Importing across features instead of using shared stores or app-layer composition
- Using `mutate` instead of `mutateAsync` in form handlers
- Guessing shadcn APIs instead of using `mcp__shadcn__*` MCP tools
- Hardcoding text instead of i18n keys
- Auth checks in individual pages instead of `_authenticated` layout route
- Forgetting `cursor-pointer` on custom clickable elements (divs, spans, table rows with `onClick`). Native `<button>` elements are covered by the global rule in `app.css`, but non-button clickable elements need it explicitly
- Skipping e2e tests or not updating e2e specs when changing pages/features — e2e must always stay in sync with code
- Using "backend not running" as an excuse to skip e2e — `prepare-e2e.sh` starts it automatically
- Using `.min(1)` in Zod schemas as a placeholder instead of the actual backend validation rules (e.g., `min=8` for passwords, `min=3, max=50` for usernames/role names) — always check the backend use case spec first
- Treating tests as optional or skipping them when the task prompt doesn't explicitly mention testing — tests are always mandatory
- Writing unit-test-style e2e (one assertion per test) instead of saga-style user journeys with `test.step()`
- Using superadmin credentials in actual tests instead of per-worker users — superadmin is only for bootstrapping
- Using retries or `waitForTimeout()` to paper over race conditions — fix the root cause (e.g., per-worker user isolation, API interception for fake-token tests)
- Forgetting to intercept `**/api/**` calls in fake-token tests — causes 401 -> clearAuth -> redirect race condition
