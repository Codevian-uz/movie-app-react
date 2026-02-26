# Movie App Platform

A professional, enterprise-grade platform for the Movie industry. This project is built with React 19, TypeScript, and Vite, designed as a modular ecosystem that includes an Admin Dashboard for catalog management, with a scalable architecture ready for user-facing portals and additional service modules.

## 🚀 Key Modules & Features

### 🛠 Admin Dashboard (Current)
- **Movie Catalog**: Full CRUD operations for movies with support for descriptions, release dates, and durations.
- **Media System**: 
    - **Posters & Backdrops**: Easy image upload and preview.
    - **Streaming trailers**: Integrated with backend streaming for high-performance video playback and seeking.
- **Categorization**: Manage genres and credits (cast & crew) associations.

### 🔐 Platform Core
- **Advanced Auth**: Secure authentication with role-based access control (RBAC).
- **Audit Logging**: Tracking of system actions for security and transparency.
- **Filevault**: Centralized file management and media delivery service.
- **Internationalization**: Full support for English, Russian, and Uzbek languages.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router) (Type-safe routing)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit/Component) & [Playwright](https://playwright.dev/) (E2E)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v22.0.0 or higher
- **pnpm**: v9.0.0 or higher
- **Backend**: A running instance of the Movie App Go Backend.

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

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8081/api
   ```

### Development

```bash
# Start development server
pnpm dev

# Run linting and formatting checks
pnpm lint

# Fix linting and formatting issues
pnpm lint:fix

# Run unit and component tests
pnpm test

# Run E2E tests (requires backend infrastructure)
./scripts/prepare-e2e.sh && pnpm test:e2e
```

## 📂 Project Structure

- `src/app/routes/`: File-based routing definitions.
- `src/components/ui/`: Reusable UI components (Shadcn).
- `src/features/`: Domain-driven feature modules (Auth, Catalog, Filevault).
- `src/hooks/`: Reusable React hooks.
- `src/lib/`: Core utilities (API client, i18n, Query client).
- `src/stores/`: Global state management with Zustand.
- `src/locales/`: Internationalization (i18n) translation files.

## 🔧 Recent Improvements

- **Date Handling**: Fixed movie creation by correctly formatting dates to RFC3339 (ISO string) for Go backend compatibility.
- **Streaming Trailers**: Optimized trailer uploads to use the streaming endpoint, enabling faster playback and seeking.
- **Enhanced Forms**: Added support for Genre UUID associations in the movie creation flow.

## 📜 License

This project is private and intended for internal use.
