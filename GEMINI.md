# GEMINI (AnimeWatch)

## Context

This is an enterprise-grade streaming platform. It features two distinct areas:
1. **Public Portal**: Modern dark aesthetic (Zinc-950/Orange-500) for users to browse and watch content.
2. **Admin Dashboard**: Liquid glass aesthetic for catalog and system management.

## Skills

For any frontend work (implementation, review, modification, planning), load these first:

1. **`frontend-guidelines`** — project architecture, conventions, and development rules
2. **`frontend-design`** — production-grade UI design (Anthropic plugin)

Do not improvise on patterns, naming, or structure — follow what the skills prescribe.

All subagents (code writers, planners, designers) MUST invoke the relevant skills before starting work.

## Rules

Always keep tests and code in sync — both unit tests AND e2e tests. When you change a page or feature, update the corresponding e2e spec too.

### E2E Testing

- **Never skip e2e tests** — not for any reason. Every feature, every edge case must be covered.
- **Saga pattern** — one comprehensive test per feature area using `test.step()`. Think user journeys, not isolated assertions.
- **Cover everything** — validation fields, filters, search, sorting, dialogs, empty states, permission-gated UI.
- **Per-worker user isolation** — never share users across parallel workers. Use the `workerAdmin`/`workerViewer` fixtures.
- **Superadmin is only for bootstrapping** in `auth.setup.ts` — never use it in actual tests.

## Verification

```bash
pnpm verify                                               # Fast: tsc + ESLint + Prettier + Vitest
pnpm verify && ./scripts/prepare-e2e.sh && pnpm test:e2e  # Full: includes Playwright
```

- If fast loop fails, fix immediately — do not proceed
- Always run the full verification (including e2e) at the end of every task — `prepare-e2e.sh` starts the backend automatically, so "backend not running" is never a valid excuse to skip e2e

## Workflow

For large tasks (features, modules, multi-page flows), break the work into manageable pieces using `TaskCreate` to plan and track them, and `Task` to parallelize independent pieces via subagents (model: `sonnet`).
