# Guidelines

Project-specific rules. Follow strictly. For design rules, see `docs/aesthetics.md`.

## Tech Stack

| Layer                | Technology                              |
| -------------------- | --------------------------------------- |
| Framework            | React 19 + TypeScript 5                 |
| Build Tool           | Vite                                    |
| Routing              | TanStack Router (type-safe, file-based) |
| Server State         | TanStack Query                          |
| Client State         | Zustand                                 |
| Forms                | React Hook Form + Zod                   |
| Styling              | Tailwind CSS 4 + shadcn/ui              |
| Unit/Component Tests | Vitest + React Testing Library          |
| E2E Tests            | Playwright                              |
| Linting              | ESLint + Prettier                       |
| Package Manager      | pnpm                                    |

## Project Structure

```
src/
├── app/                         # Routes, providers, layouts
├── components/                  # Shared components (ui/, layout/, feedback/)
├── config/                      # Environment configuration
├── features/                    # Feature modules
├── hooks/                       # Shared custom hooks
├── lib/                         # Pre-configured libraries (api-client, query-client, i18n)
├── stores/                      # Global Zustand stores
├── testing/                     # Test utilities and mocks
├── types/                       # Shared TypeScript types
└── utils/                       # Shared utilities
tests/
└── e2e/                         # Playwright E2E tests
docs/
├── guidelines.md                # This file
├── aesthetics.md                # Design & styling rules
└── specs/                       # Feature specs, API specs, templates
```

## Architecture

Layered dependency flow: `shared → features → app`

Features NEVER import from other features. Cross-feature: shared stores, query invalidation, app-layer composition, or URL state.

Each feature exposes a barrel `index.ts` — the only external import point. Only create directories that are needed.

## Naming

- Feature names are kebab-case matching backend module names
- File suffixes: `.api.ts`, `.queries.ts`, `.store.ts`, `.types.ts`, `.utils.ts`
- Components: `PascalCase.tsx` — Tests: same name + `.test.tsx` — E2E: `kebab-case.spec.ts`
- Named exports only — no default exports
- `@/` path alias for shared imports, relative paths within a feature

## State

- API data → TanStack Query. Never store API data in Zustand.
- Global client state (auth, sidebar, theme) → Zustand
- URL state (filters, pagination, tabs) → TanStack Router search params
- Use `queryOptions()` for queries. Always invalidate related queries after mutations.

## API

Backend: [go-enterprise-blueprint](https://github.com/rise-and-shine/go-enterprise-blueprint). Base URL configured in `src/config/env.ts`.

- **GET/POST only** — no PUT, PATCH, DELETE
- URL pattern: `/api/v1/{module}/{operation-id}`
- General API specs located at {backend}/docs/specs/api/general.md
- Specific API specs located at {backend}/docs/specs/modules/{module}/usecases/{domain}/{operation-id}.md
- Function names MUST match backend operation ID: `admin-login` → `adminLogin`

## Error Handling

- Network errors (`ApiException.isNetworkError`) → show `common.errors.networkError` i18n message
- Backend errors → display `error.message` directly (already translated by backend)
- After `error.message`, show `error.traceId` (if non-empty) in small mono text for debugging
- Error boundaries: Root → Layout → Feature

## Forms

- Zod schema MUST mirror backend validation rules exactly — check the backend use case spec (`{backend}/docs/specs/modules/{module}/usecases/{domain}/{operation-id}.md`) for every field's constraints (required, min, max, pattern) and replicate them in the Zod schema. Never use just `.min(1)` as a placeholder when the backend enforces stricter rules (e.g., `min=8` for passwords, `min=3, max=50` for usernames)
- When backend returns `error.fields`, mark those fields as invalid (red border via `form.setError(field, { type: 'server' })` with empty message) — do NOT display field-level error text since backend messages are not translated
- Show `error.message` as a form-level alert at the top — this is the only user-visible error text
- Use `mutateAsync` (not `mutate`) in submission handlers

## Routing

- Auth check in `_authenticated` layout route `beforeLoad`, not individual pages
- Validate search params with Zod at route level
- Pages are thin orchestrators — compose feature components, pass route data as props

## UI & Components

- Use shadcn/ui components via `mcp__shadcn__*` tools — never guess APIs
- Follow `docs/aesthetics.md` for all styling decisions
- All user-facing text goes through i18n — keys: `{feature}.{page}.{key}` or `common.{category}.{key}`

## Testing

Every feature MUST have both unit tests AND e2e tests — even if the task prompt does not explicitly ask for them. No code is considered complete without corresponding tests. When you change a page or feature, update the corresponding e2e spec too.

- Shared code → unit/component tests (Vitest + RTL)
- Feature pages/flows → E2E tests (primary), component tests only for complex isolated logic
- Tests are NOT optional — treat them as a mandatory deliverable for every task, never as an afterthought
- **Never skip e2e tests for any reason** — "backend not running", "too complex", "just a small change" are not valid excuses

### E2E Philosophy: User Journeys, Not Unit Tests

E2E tests follow the **saga pattern** — each test walks through a complete user journey, not isolated assertions.

**Core principles:**

1. **One saga per feature area.** A single test covers validation → success → CRUD → filters → search → dialogs → empty states. Use `test.step()` for granular failure reporting within the saga.
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

## Verification

```bash
pnpm verify                                               # Fast: tsc + ESLint + Prettier + Vitest
pnpm verify && ./scripts/prepare-e2e.sh && pnpm test:e2e  # Full: includes Playwright
```

- If fast loop fails, fix immediately — do not proceed
- Always run full verification (including e2e) at the end of every task — `./scripts/prepare-e2e.sh` starts the backend automatically, so "backend not running" is never a valid excuse to skip e2e

## E2E Environment

E2E tests run against a real Go backend. `./scripts/prepare-e2e.sh` clones the backend repo into `tmp/backend/`, starts it with its full infrastructure (Postgres, Redis, etc. via Docker). Set `BACKEND_REF` to pin a specific backend version (default: `main`).

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

### Seeded Superadmin

| Field    | Value           |
| -------- | --------------- |
| Username | `superadmin`    |
| Password | `superadmin123` |

> The superadmin token is **only for bootstrapping** in `auth.setup.ts`. Never use it in actual tests. Create users with appropriate roles, then test as those users to verify real authorization behavior.

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

- **`parallel`** — Read-only tests that can run concurrently (auth, permissions, sessions, audit, platform, app-shell)
- **`mutating`** — Tests that create/modify shared data, run with `workers: 1` (users, roles)

Worker count: 9 locally, 4 in CI. `MAX_WORKERS = 12` pre-creates enough users for any configuration.

### Fake-Token Tests

Some tests (route guards, minimal user) inject fake tokens to test permission enforcement without a real backend session. These tests **must** intercept API calls to prevent 401 → clearAuth → redirect race conditions:

```typescript
await page.route('**/api/**', (route) => route.fulfill({ status: 200, body: '{"content":[]}' }))
```
