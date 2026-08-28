# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Next.js 14 (App Router) + TypeScript + Tailwind marketing/ordering site for "Bánh Cuốn Tây Hồ 127", a Vietnamese restaurant. UI copy, comments, and commit messages are largely in Vietnamese — match that when editing user-facing text.

## Commands

```bash
npm install       # install deps
npm run dev       # start dev server (alias: npm run app), http://localhost:3000
npm run build     # production build
npm run start     # serve production build
npm run lint      # next lint (eslint-config-next, next/core-web-vitals)
```

There is no test runner configured in this repo. Type-checking runs via `tsc` through `next build`; there is no standalone `typecheck` script.

## Architecture

### Data flow: centralized content, not hard-coded in JSX

Nearly all display copy (brand info, nav items, dishes, testimonials, story text) lives in [src/data/site.ts](src/data/site.ts) and [src/data/menu-items.ts](src/data/menu-items.ts)/[src/data/testimonials.ts](src/data/testimonials.ts). Components import from there rather than embedding strings. When asked to change copy, prices, or images, edit the data file, not the component.

Theme tokens are defined in two synchronized places:
- [src/styles/tokens.css](src/styles/tokens.css) — CSS custom properties (`--brand-red-rgb`, etc.)
- [tailwind.config.ts](tailwind.config.ts) — maps `brand.*` Tailwind color utilities to those CSS vars

Changing a brand color requires editing both files together (there is no separate JS-side token mirror — `src/config/theme.ts` was removed as dead code; Tailwind class strings are the only place tokens are consumed outside CSS).

### Feature-based architecture: `src/features/*`

Every business domain — customer-facing and admin — owns a self-contained folder under `src/features/<domain>/`, typically `{components,hooks,services,types,mocks,context}/` plus an `index.ts` **public barrel**. Other code imports a feature only through that barrel (`@/features/<domain>`), never by reaching into `feature/<domain>/components/Internal.tsx` directly — this is what keeps ownership real instead of just cosmetic.

Current features:

| Feature | Domain | Notes |
|---|---|---|
| `features/home` | Homepage sections | `mocks/testimonials.mock.ts` |
| `features/menu` | Customer menu browse/order UI | `MenuGrid`, `ProductCard`, `FloatingCartBar`, `MenuHero`; mock menu data in `mocks/menu-api-response.mock.json` |
| `features/auth` | Customer login modal | `AuthModal`; calls `app/api/auth/*` |
| `features/checkout` | Checkout page | — |
| `features/cart` | Cart + fly-to-cart animation | Owns `context/cart-context.tsx`, `context/fly-to-cart-context.tsx` |
| `features/admin-auth` | Admin login | Separate mock stack from `features/auth` **by design** — never merge them. Calls `app/api/admin/auth/login`. Demo creds: `admin@tayho127.vn` / `admin123` |
| `features/menu-items` | Admin: simple menu-item CRUD (legacy/first Admin CRUD) | Reuses `MenuItem` type + seed array from global `src/data/menu-items.ts` (shared with `features/menu`) — no local `mocks/` |
| `features/users` | Admin: user accounts CRUD | Depends on `features/roles` (role picker) |
| `features/roles` | Admin: role/permission CRUD | — |
| `features/categories` | Admin Catalog: category CRUD | Parent-category self-reference |
| `features/media` | Admin Catalog: media library CRUD | — |
| `features/products` | Admin Catalog: product CRUD | Depends on `features/categories` + `features/media` |
| `features/menus` | Admin Catalog: menu CRUD | Not to be confused with `features/menu-items` (different, older domain) |
| `features/catalog-menu-items` | Admin Catalog: Menu↔Product junction (`priceOverride`, `sortOrder`, `isAvailable`) | Depends on `features/menus` + `features/products` |

**What stays outside `features/`** (page-chrome or genuinely cross-feature, not a business domain):
- `src/components/ui/` — UI primitives (Button, Container, ...).
- `src/components/shared/` — cross-feature components (`StatusPopup`, `Reveal`, `LanguageSwitcher`) — renamed from `components/common`.
- `src/components/layout/` — User Site chrome (`Header`, `Footer`, `FloatingActions`, `MobileHeaderMenu`); composes multiple features (cart, auth) but isn't one itself.
- `src/components/admin/{layout,dashboard,templates}/` — Admin Portal chrome + the shared `DataExplorer`/`DataEditor` CRUD template shell (see below).
- `src/services/api-client.ts` — `readApiResponse()`, shared by `features/auth` and `features/admin-auth`.
- `src/hooks/useScrollThreshold.ts` — shared by `Header` and `FloatingActions` (both layout, not features).
- `src/lib/*` — generic utils (`cn`, `normalize-text`, `format-file-size`, `format-currency`).
- `src/data/site.ts`, `src/data/menu-items.ts` — content/data genuinely shared across ≥2 features (site.ts by layout + several features; menu-items.ts by `features/menu` **and** `features/menu-items`).
- `src/provider/app-providers.tsx` — composition root (wraps `CartProvider`), not a feature itself.

### State, services, and mock backend

- Cart state lives in `features/cart` (`CartProvider`/`useCart`, `localStorage` key `tayho-cart`), wired in at [src/provider/app-providers.tsx](src/provider/app-providers.tsx), which wraps only the User Site in [app/(site)/layout.tsx](app/(site)/layout.tsx) — not `/admin`.
- Menu data: `features/menu`'s `services/menu.service.ts` exports `fetchMenu()`, returning `mocks/menu-api-response.mock.json` after a simulated delay. Mock today, but the "mock-ness" is internal to the service — swapping in a real backend means changing this file only.
- Customer auth (`features/auth`) and admin auth (`features/admin-auth`) each call their own Next.js Route Handlers under `app/api/auth/*` / `app/api/admin/auth/*`, which validate against hard-coded demo data — no real backend or session persistence yet.
- Every admin CRUD feature follows the same mock pattern: `mocks/<name>.mock.ts` exports a `SEED_*` array; `services/<name>.service.ts` imports it, reads/writes a `localStorage` key, and exposes `list/get/create/update/delete` functions. Swapping in a real backend means rewriting only that service file.
- Any new data-fetching/API-calling logic (mock or real) should follow this same pattern: a `services/<name>.service.ts` file inside the owning feature, never a raw `fetch()` inside a component.

### App Router structure

- [app/layout.tsx](app/layout.tsx) is the root layout: only `<html>`/`<body>` + global CSS imports (fonts → tokens → Tailwind base → shared component classes, in that order) + default metadata. It has no chrome and no providers — it is shared by both the User Site and the Admin Portal, so nothing customer- or admin-specific belongs here.
- [app/(site)/layout.tsx](app/(site)/layout.tsx) — User Site shell: renders `Header`/`Footer`/`FloatingActions` and wraps children in `AppProviders` (cart). The `(site)` route group does not affect URLs.
- Routes: `/` (home), `/thuc-don` (menu page), `/menu` (redirects to `/thuc-don`), `/checkout` — all under `app/(site)/`. Admin routes are under `app/admin/*` (see below).
- Pages import feature UI only via each feature's `index.ts` barrel (e.g. `import { MenuGrid } from "@/features/menu"`), never a deep path into the feature.
- Client components are explicitly marked with `"use client"` (context providers, cart/menu interactivity, animation wrappers); everything else defaults to Server Components per Next.js App Router convention.

### Admin Portal

- Routes live under `app/admin/*`, deliberately separate from `app/(site)/*` so the User Site's Header/Footer/CartProvider never leak into admin pages (and vice versa). [app/admin/layout.tsx](app/admin/layout.tsx) only provides `AdminAuthProvider` (from `features/admin-auth`); [app/admin/(auth)/login/page.tsx](app/admin/(auth)/login/page.tsx) renders unstyled by any dashboard chrome, while [app/admin/(dashboard)/layout.tsx](app/admin/(dashboard)/layout.tsx) adds the guarded shell (`AdminGuard` + `AdminSidebar` + `AdminHeader`, in `src/components/admin/layout/`) for every actual admin screen. `AdminSidebar` groups nav links into sections — a "Catalog" section holds the 5 Catalog CRUD features.
- Two reusable screen templates live in [src/components/admin/templates/](src/components/admin/templates/) and are shared across **every** admin CRUD feature (8 of them, listed above):
  - **DataExplorer** (`DataExplorer/DataExplorer.tsx` + `useDataExplorer.ts`) — list screen: search, table, delete-with-confirm. Config-driven via props (`columns`, `getSearchableText`, `editHref`, `onDelete`, ...).
  - **DataEditor** (`DataEditor/DataEditor.tsx` + `useDataEditor.ts`) — create/update/delete screen chrome (Save/Delete buttons, confirm-delete + error popups via `StatusPopup`). Form fields are **not** generic — each feature supplies its own field JSX as `children`.
  - `StatusBadge` and `formFieldClassName.ts` (shared input/label Tailwind classes) round out the template layer.
  - Only this UI shell is shared. Each feature still owns its own `services/<name>.service.ts` (API contract) and field/validation logic — don't build a generic `CrudService<T>`.
- Adding a new admin CRUD domain means creating a new `src/features/<name>/` following the same shape (service + mocks + Explorer/Editor composing the shared templates + a route under `app/admin/(dashboard)/`) — the templates themselves shouldn't need to change.

### Dependency direction and hook placement

- Enforced direction: `Page (app/*) → Feature (features/<domain>, via its index.ts) → Shared Component (components/{ui,shared}, components/{layout,admin/*}) → UI Primitive (components/ui)`, and `Feature → its own services/*.service.ts → Route Handler`. Primitives/shared components never import from a feature, `lib`/`services` never import from `components` or `features`, and a feature never reaches into another feature's internals — only its `index.ts` (verified clean; keep it that way).
- Hooks: a hook used by exactly **one** component lives in that feature's `hooks/` (e.g. `features/auth/hooks/useAuthModal.ts`). A hook used by **two or more** components that aren't part of the same feature lives in global `src/hooks/` (e.g. `src/hooks/useScrollThreshold.ts`, shared by layout components). Promote a hook to global `src/hooks/` only once it actually gains a cross-feature consumer — don't pre-emptively centralize.

## Project-specific rules and skills

This repo has its own Claude Code rules and skills that take precedence over generic conventions:

- `.claude/CLAUDE.md.txt` — detailed working-principle rules (in Vietnamese): reuse-before-create, dependency direction (`Page → Feature Component → Shared Component → UI Primitive`), scope control, and a screenshot-to-UI workflow. Read this before larger changes.
- `.claude/rules/` — `architecture.md.txt`, `frontend-ui.md.txt`, `api-integration.md.txt`, `code-quality.md.txt`.
- `.claude/skills/` — `screenshot-to-ui`, `build-ui-component`, `integrate-api`, `debug-ui`, `refactor-code`.

Key points from those rules worth internalizing: prefer Server Components unless client interactivity is needed; avoid `any`/`@ts-ignore`/`@ts-nocheck`; don't introduce a new UI dependency when Tailwind/an existing internal component already solves it; don't refactor or restructure beyond what the current task requires.
