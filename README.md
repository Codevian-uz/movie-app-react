# AnimeWatch Platform

A professional, enterprise-grade platform for the Anime & Movie industry. This project is built with React 19, TypeScript, and Vite, designed as a modular ecosystem that includes a high-performance Public Portal and an advanced Admin Dashboard.

## 🚀 Key Modules & Features

### 📺 Public Portal (AnimeWatch)

- **Home Experience**: Interactive spotlight carousel, "Continue Watching" for authenticated users, and dynamic sections for Trending, Popular, and New Releases.
- **Advanced Catalog**: Comprehensive filtering by **Kind** (Movie/Series) and **Genre**, with multi-criteria sorting.
- **Deep Content**: Detailed movie/series pages with cast, recommendations, and interactive comment sections.
- **Video Player**: Custom streaming integration with support for multiple sources, automatic transcoding status handling (`ready`, `processing`, `failed`), and progress tracking.

### 🛠 Admin Dashboard

- **Catalog Management**: Full CRUD for Movies, Series, Episodes, Seasons, Genres, People, and Studios.
- **Media Engine**: Optimized asset management for posters, backdrops, and video streams.
- **RBAC Management**: Fine-grained role and permission management for system users.

### 🔐 Platform Core

- **Advanced Auth**: Secure session management with multi-device revocation support.
- **Audit Logging**: Comprehensive tracking of system actions and status changes.
- **Filevault**: Centralized media delivery service.
- **Internationalization**: Full support for English, Russian, and Uzbek languages.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router) (Type-safe, file-based)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit) & [Playwright](https://playwright.dev/) (E2E)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v22.0.0 or higher
- **pnpm**: v9.0.0 or higher
- **Backend**: [Movie App Go Backend](https://github.com/Jaxongir1006/movie-app-go)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd movie-app-react
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables (`.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:8081/api
   ```

### Development

```bash
pnpm dev          # Start development server
pnpm verify       # Run full linting + unit tests
pnpm test:e2e     # Run E2E tests (requires ./scripts/prepare-e2e.sh)
```

## 📂 Project Structure

- `src/app/routes/`: File-based routing definitions.
- `src/features/`: Domain-driven feature modules (Auth, Catalog, Interactions, Audit, Platform).
- `src/components/`: Shared UI and Layout components.
- `src/stores/`: Global Zustand stores (Auth, Locale, Theme, Sidebar).

## 🔧 Recent Improvements

- **Filtering System**: Implemented server-side `kind` (Movie/Series) and `genre` filtering in the public catalog.
- **Public Navigation**: Fully functional Public Header and Footer with search integration and deep linking.
- **Streaming Reliability**: Improved video player state handling for pending/failed transcodings.
- **Verification Stability**: Resolved all TypeScript, ESLint, and Formatting issues project-wide.

## 📜 License

This project is private and intended for internal use.
