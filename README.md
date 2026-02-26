# React Enterprise Blueprint

Frontend counterpart to [go-enterprise-blueprint](https://github.com/rise-and-shine/go-enterprise-blueprint).

## Philosophy

1. **Agent-driven** — designed for AI-assisted development with Claude Code / Codex
2. **System-tested** — E2E tests cover real user flows against the running app
3. **Strict quality** — linting, type checking, and testing are mandatory

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- Running [go-enterprise-blueprint](https://github.com/rise-and-shine/go-enterprise-blueprint) backend

### Development

```bash
pnpm install                               # Install dependencies
pnpm dev                                   # Start development server
pnpm lint                                  # Run linting
pnpm test                                  # Run unit/component tests
./scripts/prepare-e2e.sh && pnpm test:e2e  # Run E2E tests (spins up full backend infrastructure)
```

## Documentation

- [docs/aesthetics.md](docs/aesthetics.md) — design rules
- [docs/guidelines.md](docs/guidelines.md) — project structure, architecture, and all development rules
