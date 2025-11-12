# Mantrapurna

<img width="1905" height="951" alt="mantrapurna" src="https://github.com/user-attachments/assets/c07f7111-b8b2-440d-bb58-3c8667ea0d9d" />

Mantrapurna is a mindfulness practice companion built with Next.js 15 and React 19. It helps practitioners create mantra libraries, log repetitions, track streaks, and review progress through an accessible dashboard. The application ships with an offline-first data layer, optional API integration, and polished UI elements tailored for touch and desktop experiences.

## Key Features
- Personal mantra management with goals, repetition logging, and streak tracking
- Gradient progress indicators that highlight daily goal completion
- Achievements system surfacing streaks, consistency milestones, and practice time insights
- Dashboard analytics with weekly charts, top mantra summaries, and completion metrics
- JSON export/import workflow for backing up or restoring mantra and session data
- Authentication via NextAuth (OAuth providers) or a mock email flow for local development
- Responsive design, light/dark theme toggle, and Tailwind-powered UI components

## Tech Stack
- Next.js 15 (App Router) and React 19
- TypeScript with strict typing across components and services
- Tailwind CSS and shadcn/ui primitives (Radix UI under the hood)
- Recharts for lightweight data visualisation
- NextAuth for OAuth, Sonner for notifications, React Hook Form with Zod validation
- LocalStorage persistence with optional Postgres-backed API endpoints

## Requirements
- Node.js 18.18+ and npm 9+ (pnpm, yarn, or bun also supported)
- Modern browser with LocalStorage enabled

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment defaults and update secrets:
   ```bash
   cp .env.example .env.local
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 and sign in using Google/GitHub OAuth or the mock email flow.

## Available Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server with hot reloading. |
| `npm run build` | Create an optimised production build. |
| `npm run start` | Serve the production build locally. |
| `npm run lint` | Run ESLint using the project configuration. |

## Environment Variables
Configure secrets in `.env.local`. The most commonly used variables are listed below.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Optional | Postgres connection string for Supabase or another managed instance. |
| `JWT_SECRET` | Optional | Secret for custom JWT handling when using bespoke APIs. |
| `NEXTAUTH_SECRET` | Required | Secret used by NextAuth for session handling. |
| `NEXTAUTH_URL` | Required | Base URL for the app (set to `http://localhost:3000` during development). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Enables Google OAuth through NextAuth. |
| `GITHUB_ID` / `GITHUB_SECRET` | Optional | Enables GitHub OAuth through NextAuth. |
| `NEXT_PUBLIC_USE_API` | Optional | When set to `true`, the UI prefers REST API routes over local storage. |
| `DROPBOX_ACCESS_TOKEN` | Optional* | Required to enable Dropbox backup uploads via `/api/dropbox/upload`. |

\*Optional for the base experience but required before enabling Dropbox synchronisation in production environments.

## Project Structure
```
src/
  app/               Application routes, layouts, and API handlers
  components/        UI building blocks (forms, dashboard, progress bars, dialogs)
  lib/               Data services, hybrid storage layer, authentication context
  types/             Shared TypeScript interfaces
public/              Static assets including the Om logo
```

Key UI modules include `components/mantra-list.tsx`, `components/dashboard.tsx`, and `components/achievements.tsx`. Data utilities such as `lib/mantra-service.ts`, `lib/hybrid-mantra-service.ts`, and `lib/data-export-service.ts` encapsulate persistence and synchronisation logic.

## Data Flow Overview
- The `AuthProvider` in `lib/auth-context.tsx` hydrates user state from NextAuth sessions or mock local credentials.
- Mantra and session data default to LocalStorage via `lib/mantra-service.ts`. When `NEXT_PUBLIC_USE_API=true`, requests are routed through `lib/api-service.ts` to the Next.js API layer with a graceful local fallback.
- Aggregated insights (daily counts, streaks, most-practiced summaries) are computed in `lib/stats-service.ts` and rendered by the dashboard and achievements components.
- Export/import actions rely on `DataExportService`, writing portable JSON backups that include version metadata for future migrations.

## Authentication Modes
- **OAuth (production-ready):** Configure Google and/or GitHub credentials. NextAuth stores sessions server-side and exposes the authenticated user to the app router.
- **Email (local development):** The mock auth service in `lib/mock-auth.ts` simulates registration and login with a predictable password (`password123`). Credentials persist in LocalStorage so flows can be tested without a backend.

## Tracking and Insights
- Mantra cards provide daily progress bars with a white-to-orange gradient, optional streak badges, and quick repetition logging optimised for touch interactions.
- The statistics tab surfaces weekly bar charts, streak metrics, total repetitions, and achievement milestones to encourage consistent practice.
- Reset controls support clearing the current day or all history for a specific mantra, with confirmation dialogs to prevent accidental loss.

## Styling and Theming
- Tailwind CSS drives layout and typography, with design tokens defined in `app/globals.css` and `tailwind.config.js`.
- shadcn/ui primitives provide accessible dialogs, dropdowns, progress bars, and form controls based on Radix UI components.
- The theme toggle (`components/theme-toggle.tsx`) switches between light and dark palettes. Progress indicators and gradient surfaces adapt to the active theme.

## Deployment
1. Ensure environment variables for NextAuth and any database connections are set in the target environment.
2. Build the application with `npm run build`.
3. Start the server with `npm run start` or deploy to Vercel for serverless hosting. The API routes under `src/app/api` are compatible with Next.js edge/serverless runtimes.

## Troubleshooting
- **Local development without Postgres:** The hybrid service automatically falls back to LocalStorage. If you intend to test API routes, configure `DATABASE_URL` and run the setup scripts documented in `setup-database/` and `DEMO_SETUP.md`.
- **Authentication loops:** Check that `NEXTAUTH_URL` matches the browser origin and that OAuth callback URLs are registered with your providers.
- **Missing data after refresh:** LocalStorage is scoped per browser. Ensure the correct profile is used and that privacy modes (such as incognito) are not clearing data.
