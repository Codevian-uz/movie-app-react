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
- **Public Portal**: Uses `PublicHeader` and `PublicFooter` from `catalog` feature. Pages are located in `src/app/routes/*.tsx`.
- **Admin Dashboard**: Located in `src/app/routes/admin/`. Uses liquid glass aesthetic.

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
- **Pagination**: Use `page_number` (1-indexed) and `page_size`.
- **Filtering**: Use `kind` ('movie' | 'series') and `genre_id` for catalog listings.

## Error Handling

- Network errors (`ApiException.isNetworkError`) -> show `common.errors.networkError` i18n message
- Backend errors -> display `error.message` directly (already translated by backend)
- After `error.message`, show `error.traceId` (if non-empty) in small mono text
- Error boundaries: Root -> Layout -> Feature

## Forms

- Zod schema MUST mirror backend validation rules exactly — check the backend use case spec for constraints.
- `error.fields` -> mark fields invalid via `form.setError(field, { type: 'server' })` with empty message.
- Show `error.message` as form-level alert at top.
- Use `mutateAsync` (not `mutate`) in submission handlers.

## Routing

- Auth check in `_authenticated` layout route `beforeLoad`, not individual pages.
- Validate search params with Zod at route level. Use `.catch()` for default values in search schemas.
- Pages are thin orchestrators — compose feature components, pass route data as props.

## UI & Components

- Use shadcn/ui components via `mcp__shadcn__*` MCP tools.
- All user-facing text goes through i18n — keys: `{feature}.{page}.{key}` or `common.{category}.{key}`.
- **Cursor pointer**: Tailwind v4 does NOT set `cursor: pointer` on `<button>` elements by default. A global rule in `app.css` handles native buttons. When creating custom clickable elements (divs/spans with `onClick`, table rows), always add `cursor-pointer` explicitly.

## Testing

Every feature MUST have both unit tests AND e2e tests. No code is considered complete without corresponding tests.

- Shared code -> unit/component tests (Vitest + RTL)
- Feature pages/flows -> E2E tests (primary).
- **Never skip e2e tests for any reason**.

### E2E Philosophy: User Journeys

E2E tests follow the **saga pattern** — each test walks through a complete user journey.

1. **One saga per feature area.**
2. **Think like a user.**
3. **One login per test.**
4. **Cover every edge case.**
5. **Fail fast with descriptive steps.**

## Verification

```bash
pnpm verify                                               # Fast: tsc + ESLint + Prettier + Vitest
pnpm verify && ./scripts/prepare-e2e.sh && pnpm test:e2e  # Full: includes Playwright
```

- If fast loop fails, fix immediately.
- Always run full verification at the end of every task.
