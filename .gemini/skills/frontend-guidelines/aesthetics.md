# Aesthetics

Two distinct visual languages: **admin UI** (liquid glass) and **user-facing UI** (clean/flat shadcn defaults).

## Admin UI: Liquid Glass

Admin routes (`/admin/*`) use liquid glass aesthetic, scoped via `data-admin` attribute on the admin layout wrapper. Glass styles are isolated — user-facing routes remain untouched.

### Visual Properties

- **Glass panels**: Translucent surfaces with `backdrop-filter: blur()`, specular highlights, soft shadows
- **Ambient background**: Gradient mesh with soft colored blobs visible through glass
- **Typography**: Outfit (Google Fonts) — geometric variable-weight sans-serif
- **Border radius**: `1rem` for glass panels, shadcn defaults for inner controls
- **Depth**: Layered glass at different opacity/blur levels (sidebar heaviest, cards standard)

### Glass Hierarchy

| Surface  | Background          | Blur | Purpose               |
| -------- | ------------------- | ---- | --------------------- |
| Sidebar  | `--glass-bg-subtle` | 28px | Persistent navigation |
| Header   | `--glass-bg-subtle` | 16px | Toolbar bar           |
| Cards    | `--glass-bg`        | 16px | Content containers    |
| Popovers | Higher opacity      | 20px | Overlays              |
| Inputs   | `--input`           | 8px  | Inset feel            |

### Admin Don'ts

- No nesting glass panels more than 1 level deep
- No `backdrop-filter` on scrolling containers — only fixed/sticky elements and cards
- Keep blur at 16px standard, 28px max for sidebar
- Always test dark mode — glass opacity values differ

## User-Facing UI

### shadcn/ui Configuration

| Setting    | Value      |
| ---------- | ---------- |
| Style      | New York   |
| Base color | Neutral    |
| Accent     | Teal       |
| Radius     | 0.5rem     |
| Mode       | Light/Dark |

Teal accent palette — primary buttons and focus rings use teal. Neutral grays for backgrounds and text.

### Theme

- Dark mode via `class` strategy, default follows system preference
- User toggles via theme switcher in header
- All components must look correct in both modes — never hardcode colors

### Layout

- **Collapsible sidebar** navigation (full labels -> icon-only)
- Sidebar state persisted in Zustand store
- Content area: `max-w-screen-2xl` container, centered
- Page structure: sidebar + header + main content area

### Spacing & Density

Compact but readable:

- Page padding: `p-6`
- Card padding: `p-4` (small) / `p-6` (full-width)
- Stack gap: `gap-4` (default) / `gap-6` (between sections)
- Form field gap: `gap-4`
- Table row height: default shadcn (compact)
- Minimum touch target: 32px

### Typography

System font stack for user-facing UI. Admin uses Outfit (auto-applied via `data-admin`).

- Page title: `text-2xl font-semibold tracking-tight`
- Section title: `text-lg font-semibold`
- Body: `text-sm` (dashboard content default)
- Muted/secondary: `text-sm text-muted-foreground`
- No `text-xs` for primary content — only badges, timestamps, metadata

### Components

shadcn/ui exclusively. No custom-styled alternatives.

- **Buttons**: `default` (primary), `outline` (secondary), `ghost` (tertiary), `destructive` (dangerous)
- **Forms**: shadcn `Form` + `FormField` wrappers always — never raw inputs
- **Tables**: shadcn `DataTable` pattern with sorting, filtering, pagination
- **Dialogs**: `Dialog` for confirmations/quick forms, full page for complex forms
- **Toasts**: `Sonner` for success/error — brief, auto-dismiss
- **Loading**: `Skeleton` for initial loads, spinner only for action buttons

### Iconography

`lucide-react` icons (bundled with shadcn/ui). Size `16px` (inline/buttons) or `20px` (standalone).

### Feedback & States

- **Empty states**: Icon + title + description + action button, centered
- **Error states**: Inline `Alert` with `destructive` variant for section errors, toast for action errors
- **Loading states**: Skeleton placeholders matching content shape — no spinners for page loads
- **Disabled states**: shadcn built-in disabled styling, never gray out manually

### Interactive States

- **Cursor pointer**: Global CSS rule (`app.css`) sets `cursor: pointer` on `<button>` and `[role="button"]`. For custom clickable elements (e.g. `<div onClick>`, `<TableRow onClick>`), always add `cursor-pointer` explicitly
- **Hover feedback**: All clickable elements must have visible hover state (background change, color change, or opacity transition)

### Don'ts

- No custom colors outside shadcn CSS variable system
- No shadows heavier than `shadow-sm`
- No animations beyond shadcn defaults (subtle transitions only)
- No decorative elements, gradients, or illustrations
- No nested cards
- No horizontal scrolling in main content area
- No clickable elements without `cursor-pointer` and visible hover feedback
