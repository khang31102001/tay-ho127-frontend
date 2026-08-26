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

### Home vs. menu component trees

- `src/components/home/*` — homepage sections (`TopHero`, `StorySection`, `PromotionZone`, `FavoriteSection`, `ExperienceSection`, `TestimonialsSection`), wired into [app/page.tsx](app/page.tsx).
- `src/components/menu/*` — the live menu/ordering UI (`MenuGrid`, `ProductCard`, `FloatingCartBar`), rendered on [app/thuc-don/page.tsx](app/thuc-don/page.tsx) alongside `src/components/sections/MenuHero`. [app/menu/page.tsx](app/menu/page.tsx) is just a server-side `redirect("/thuc-don")` (an English-URL alias) — there's only one real menu page.
- `src/components/sections/*` is mostly legacy from before the homepage/menu redesign and has been pruned down to the two pieces still in use: `MenuHero` (live) and `CTASection` (imported by `thuc-don/page.tsx` but its render is currently commented out — a deliberate WIP toggle, not dead code). Don't add new components here; extend `home/*` or `menu/*` instead.

### State, services, and mock backend

- Cart state: [src/contexts/cart-context.tsx](src/contexts/cart-context.tsx) (`CartProvider`/`useCart`), a client-only React context persisted to `localStorage` under key `tayho-cart`. Wired in at [src/provider/app-providers.tsx](src/provider/app-providers.tsx), which wraps the whole app in [app/layout.tsx](app/layout.tsx).
- Menu data: [src/services/menu-service.ts](src/services/menu-service.ts) exports `fetchMenu()`, which returns [src/api/menu-api-response.json](src/api/menu-api-response.json) after a simulated delay, typed via [src/types/menu.ts](src/types/menu.ts). Mock today, but the "mock-ness" is internal to the service — swapping in a real backend means changing this file only, not any component.
- Auth: [src/services/auth-service.ts](src/services/auth-service.ts) calls Next.js Route Handlers under `app/api/auth/*` (`login`, `google`, `register`, `forgot-password`), which currently validate against hard-coded demo data and return mock tokens/messages — there is no real backend or session persistence yet.
- Any new data-fetching/API-calling logic (mock or real) should follow this same pattern: a `src/services/<domain>-service.ts` file that components/pages call, never a raw `fetch()` inside a component.

### App Router structure

- [app/layout.tsx](app/layout.tsx) is the root layout: imports global CSS (fonts → tokens → Tailwind base → shared component classes, in that order), renders shared `Header`/`Footer`/`FloatingActions`, and wraps children in `AppProviders`.
- Routes: `/` (home), `/thuc-don` (menu page), `/menu` (redirects to `/thuc-don`), `/checkout`.
- Client components are explicitly marked with `"use client"` (context providers, cart/menu interactivity, animation wrappers); everything else defaults to Server Components per Next.js App Router convention.

### Dependency direction and hook placement

- Enforced direction: `Page (app/*) → Feature Component (components/{home,menu,auth,checkout,layout,product}) → Shared Component (components/common) → UI Primitive (components/ui)`, and `Component → Service (services/*) → Route Handler`. Primitives/shared components never import from a feature folder, and `lib`/`services` never import from `components` — verified clean; keep it that way.
- Hooks: a hook used by exactly **one** component is co-located next to it (`src/components/<folder>/use<Thing>.ts`, e.g. `src/components/auth/useAuthModal.ts`) — logic stays close to what uses it. A hook used by **two or more** components lives in `src/hooks/` (e.g. `src/hooks/useScrollThreshold.ts`). Promote a co-located hook to `src/hooks/` only once it actually gains a second consumer — don't pre-emptively centralize.

## Project-specific rules and skills

This repo has its own Claude Code rules and skills that take precedence over generic conventions:

- `.claude/CLAUDE.md.txt` — detailed working-principle rules (in Vietnamese): reuse-before-create, dependency direction (`Page → Feature Component → Shared Component → UI Primitive`), scope control, and a screenshot-to-UI workflow. Read this before larger changes.
- `.claude/rules/` — `architecture.md.txt`, `frontend-ui.md.txt`, `api-integration.md.txt`, `code-quality.md.txt`.
- `.claude/skills/` — `screenshot-to-ui`, `build-ui-component`, `integrate-api`, `debug-ui`, `refactor-code`.

Key points from those rules worth internalizing: prefer Server Components unless client interactivity is needed; avoid `any`/`@ts-ignore`/`@ts-nocheck`; don't introduce a new UI dependency when Tailwind/an existing internal component already solves it; don't refactor or restructure beyond what the current task requires.
