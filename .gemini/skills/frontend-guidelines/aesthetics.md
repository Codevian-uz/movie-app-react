# Aesthetics

Two distinct visual languages: **Admin UI** (Liquid Glass) and **Public Portal** (AnimeWatch Dark).

## Admin UI: Liquid Glass

Admin routes (`/admin/*`) use liquid glass aesthetic, scoped via `data-admin` attribute on the admin layout wrapper.

### Visual Properties (Admin)

- **Glass panels**: Translucent surfaces with `backdrop-filter: blur()`, specular highlights, soft shadows.
- **Ambient background**: Gradient mesh with soft colored blobs visible through glass.
- **Typography**: Outfit (Google Fonts) — geometric sans-serif.
- **Border radius**: `1rem` for glass panels.

## Public Portal: AnimeWatch Dark

Public routes (`/`, `/movies`, `/watch/*`, etc.) use a modern, high-contrast dark aesthetic inspired by premium streaming services.

### Visual Properties (Public)

- **Background**: Deep Zinc-950 (`#09090b`).
- **Primary Accent**: Orange-500 (`#f97316`) for calls to action, active states, and highlights.
- **Secondary Accent**: Zinc-100 for primary text, Zinc-400/500 for secondary text.
- **Typography**: System font stack (Inter/Geist) with heavy weights for headings (`font-black`, `tracking-tight`).
- **Surfaces**: Zinc-900/50 with `backdrop-blur-xl` for cards and navigation bars.

### Component Styles (Public)

- **Buttons**: Rounded-full, high-elevation shadows for primary actions.
- **Cards**: Aspect-ratio based (2/3 for posters, 16/9 for backdrops), subtle hover transforms (`hover:-translate-y-1`).
- **Spotlight**: Large background backdrops with radial/linear gradients to black for text readability.
- **Progress**: Sleek thin progress bars for "Continue Watching" using the orange accent.

### Interactive States (Public)

- **Cursor pointer**: Mandatory for all clickable elements (`cursor-pointer`).
- **Hover feedback**: Strong transitions (opacity, scale, color shift to orange).

## Spacing & Density

- **Admin**: Compact dashboard density (`gap-4`, `p-6`).
- **Public**: Cinematic spacing (`pt-28` for header clearance, `gap-12` between major sections, `container` max-width).

## Feedback & States

- **Loading**: Pulse skeletons matching content shape.
- **Empty States**: Centered icons with ghost buttons.
- **Error States**: High-contrast alerts or full-page "Not Found" views with "Go Home" actions.
