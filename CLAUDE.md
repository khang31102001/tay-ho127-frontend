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

Content shown on the Site comes from the Backend where a module exists (catalog, menus, banners, articles, SEO, **brand identity + contact**, navigation). Brand/contact (address, phone, opening hours, social links) is managed by Admin at Tổ chức → Thông tin thương hiệu / Chi nhánh and read through `getSiteBrand()` (`features/brand-profile/services/brand-public.service.ts`, server-only) — pass the `SiteBrand` down as a prop and format it with `features/brand-profile/utils/site-contact.ts`; never hard-code contact strings in components (an empty value means "hide that block"). [src/data/site.ts](src/data/site.ts) now only holds the display name, default tagline and static image paths. What still has no Backend (story text, stats, testimonials) stays in components/mocks until its phase in `docs/proposals/dynamic-content-completion-plan.md`.

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
| `features/menu` | Customer menu browse/order UI | `MenuGrid`, `ProductCard`, `MenuHero`; mock menu data in `mocks/menu-api-response.mock.json` |
| `features/auth` | Customer login modal + session (real Backend via BFF) | `AuthModal`; `AuthProvider` asks `app/api/customer/session` who is signed in (token in HttpOnly cookie, never in the browser). Login/register go through `app/api/customer/auth/{login,register,logout}` → Backend `/customer/auth/*`; Google sign-in and forgot-password are NOT wired yet |
| `features/checkout` | Checkout page | Sends only ids/quantities/discount code — the Backend prices everything. COD → `createOrder`, QR/wallet → `createPaymentSession` |
| `features/cart` | Cart + fly-to-cart animation | Owns `context/cart-context.tsx`, `context/fly-to-cart-context.tsx` |
| `features/admin-auth` | Admin login/session (real Backend via BFF) | Separate from `features/auth` (Site customers) **by design** — never merge them. Calls `app/api/admin/auth/{login,logout,session}`; `useAdminAuth().hasPermission(code)` gates UI by Backend permission codes (`users.view`...). No demo creds — accounts live in the Backend (Migrator `seed`/`seed-demo`) |
| `features/permissions` | Admin: permission tree CRUD (Backend AccessControl) | Tree = Module → Resource group → leaf via `parentId`/`isGroup`. Groups (`group:*` codes) only organise; **never** assign a group to a menu/JWT — only leaf codes are checked. Exports `PermissionTree`, `getPermissionTree` (`GET /permissions/tree`) |
| `features/navigation` | Navigation for BOTH the Admin sidebar (`scope="admin"`, `/admin/system/menus`) and the Site menus (`scope="site"`: header/footer/mobile, `/admin/settings/navigation`) (Backend Navigation) | One tree model, max 3 levels. Admin items are gated by permission LEAF codes via `PermissionTree` (needs `menus.permissions.manage`); Site menus are public — the Site reads them in `app/(site)/layout.tsx` through `services/public-navigation.service.ts` (server-only, deep import, 60 s cache). Manage permissions: `menus.*` (admin sidebar) vs `site-navigation.*` (Site). The menu containers are fixed seed fixtures (edit name/active only). Replaces the old `features/admin-menus` and the localStorage mock |
| `features/organization` | Admin: organizations / departments (tree) / brands (Backend Organization) | Exports `OrganizationSelect`, user-scope services used by `features/users` |
| `features/platform` | Admin: fiscal years, system settings, audit logs (Backend Platform) | — |
| `features/menu-items` | Admin: simple menu-item CRUD (legacy/first Admin CRUD) | Reuses `MenuItem` type + seed array from global `src/data/menu-items.ts` (shared with `features/menu`) — no local `mocks/` |
| `features/users` | Admin: user accounts (Backend Identity) | Assigns roles (`features/roles`) and department/brand scopes (`features/organization`) |
| `features/roles` | Admin: roles + their permissions (Backend AccessControl) | Permission picker = `PermissionTree` from `features/permissions` (ticking a group ticks every leaf below it; only leaf ids are saved) |
| `features/categories` | Admin Catalog: category CRUD (Backend Catalog) | Parent-category tree, max 3 levels |
| `features/media` | Admin media library (Backend Media) + `listMedia()` for Site/MediaPicker | `listMedia()` = mock seed (ids referenced by still-mock content) + active Backend media (`GET /media/public`); images from hosts not in `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` are excluded |
| `features/products` | Admin Catalog: product CRUD + CSV import/export (Backend Catalog) | `slug` = public URL `/thuc-don/{slug}`; depends on `features/categories` + `features/media` + `features/modifier-groups` |
| `features/menus` | Admin Catalog: sales-menu CRUD (Backend Catalog) | `code` is immutable — the Site looks menus up by code (`thuc-don-chinh`, `mon-yeu-thich`, `goi-y-them`) |
| `features/menu-products` | Admin Catalog: Menu↔Product junction (`priceOverride`, `sortOrder`, `isAvailable`) (Backend Catalog) | Depends on `features/menus` + `features/products` |
| `features/modifier-groups` | Admin Catalog: modifier groups + options (Backend Catalog) | Options keep their id when edited (cart/order snapshots reference it) |
| `features/catalog-public` | Site read-model of the Catalog (`GET /catalog/public`, anonymous) | Used by `features/menu`, reorder — never the Admin services |
| `features/brand-profile` | Admin Tổ chức → Thông tin thương hiệu (Backend Organization, singleton) | Brand-wide IDENTITY only: name, tagline, logos, legal name/tax code, social links. NO address/phone/hours (those are per branch). Site reads it via `brand-public.service.ts` (server-only, `GET /organization/public/brand`) = profile + the PRIMARY branch's contact, used by SEO JSON-LD |
| `features/promotions` | Admin Catalog: discount codes (Backend Catalog) + Checkout code check | Admin CRUD in `promotion.service.ts`; Site check in `site-promotion.service.ts` (`app/api/catalog/promotions/validate`). `usageCount` is owned by the Backend |
| `features/delivery-methods`, `features/payment-methods`, `features/order-options` | Admin Cấu hình: delivery methods, payment methods, general order options (Backend Sales) | One service each: Admin CRUD via `adminApi`, enabled-only list for Cart/Checkout via `salesApi`. `code` is immutable. The public payment-method list never carries bank details/gateway |
| `features/order-settings` | Admin Cấu hình đơn hàng (Backend Sales, singleton) | Order-code format (prefix/date part/length) + payment-session minutes |
| `features/orders` | Admin Sales → Đơn hàng + Site order tracking/history (Backend Sales) | Admin: `order.service.ts` (list/get/status, `nextStatuses` from the Backend). Site: `site-order.service.ts` (create, lookup by code+phone, history); the phone is remembered in `tayho-order-phones` so the tracking page does not ask again |
| `features/payments` | Admin Sales → Thanh toán (Backend Sales) | Payments + append-only transaction trail + the panel of payment sessions waiting for staff to confirm money (`payments.manage`) |
| `features/payment` | Site payment page for QR/wallet (Backend Sales) | A payment session reserves the order; staff confirm in Admin, the page polls and redirects. The customer has no way to mark it paid |

**What stays outside `features/`** (page-chrome or genuinely cross-feature, not a business domain):
- `src/components/ui/` — UI primitives (Button, Container, ...).
- `src/components/shared/` — cross-feature components (`StatusPopup`, `Reveal`, `LanguageSwitcher`) — renamed from `components/common`.
- `src/components/layout/` — User Site chrome (`Header`, `Footer`, `FloatingActions`, `MobileHeaderMenu`); composes multiple features (cart, auth) but isn't one itself.
- `src/components/admin/{layout,dashboard,templates}/` — Admin Portal chrome + the shared `DataExplorer`/`DataEditor` CRUD template shell (see below).
- `src/services/api-client.ts` — `readApiResponse()`, used by `features/auth` (Site) for `app/api/auth/*`.
- `src/lib/http/` — `api-client.ts` (`createHttpClient`, ProblemDetails-aware errors), `admin-api.ts` (`adminApi`: Backend calls from the Admin Portal through the BFF), `backend-fetch.ts` (server-only Backend fetch). `src/lib/auth/` — BFF session (HttpOnly cookies, refresh).
- `src/hooks/useAsyncData.ts` — shared loading/error/reload state for Admin Explorer/Editor hooks.
- `src/hooks/useScrollThreshold.ts` — shared by `Header` and `FloatingActions` (both layout, not features).
- `src/lib/*` — generic utils (`cn`, `normalize-text`, `format-file-size`, `format-currency`).
- `src/data/site.ts`, `src/data/menu-items.ts` — content/data genuinely shared across ≥2 features (site.ts by layout + several features; menu-items.ts by `features/menu` **and** `features/menu-items`).
- `src/provider/app-providers.tsx` — composition root (wraps `CartProvider`), not a feature itself.

### State, services, and mock backend

- Cart state lives in `features/cart` (`CartProvider`/`useCart`, `localStorage` key `tayho-cart`), wired in at [src/provider/app-providers.tsx](src/provider/app-providers.tsx), which wraps only the User Site in [app/(site)/layout.tsx](app/(site)/layout.tsx) — not `/admin`.
- Menu data: `features/menu`'s `services/menu.service.ts` exports `fetchMenu()`, returning `mocks/menu-api-response.mock.json` after a simulated delay. Mock today, but the "mock-ness" is internal to the service — swapping in a real backend means changing this file only.
- Customer auth is real: BFF Route Handlers `app/api/customer/*` (login/register/logout/session) talk to Backend `/customer/auth/*` and keep the customer JWTs in HttpOnly cookies (`src/lib/auth/customer-backend-session.ts`, separate from the Admin cookies). Only `app/api/auth/forgot-password` is still a mock.
- Site ↔ Sales: the browser calls `salesApi` (`src/lib/http/sales-api.ts`) → `app/api/sales/[...path]` which forwards ONLY an allowlist of customer endpoints (`/public/*`, `/customer/orders*`) to Backend `/api/v1/sales/*`, attaching the customer cookie when present (guests still order). Admin Sales endpoints are never reachable from there — Admin uses `adminApi`. The Backend is the only place money is computed.
- Admin auth is real: BFF Route Handlers `app/api/admin/auth/*` log in against the ASP.NET Core Backend (`BACKEND_API_URL`, server-only) and keep its JWTs in HttpOnly cookies; `app/api/admin/backend/[...path]` proxies every Admin call to Backend `/api/v1/*` (adds Bearer, refreshes on 401). The browser never sees a token and the Backend needs no CORS.
- Admin features backed by the Backend (users, roles, permissions, navigation (admin sidebar + site menus), organization, platform, customers, media library, catalog: categories/products/menus/menu-products/modifier-groups/promotions, sales: delivery-methods/payment-methods/order-options/order-settings/orders/payments): `services/<name>.service.ts` calls `adminApi` and maps Backend DTOs to the feature's types.
- The Site reads the catalog it sells from `features/catalog-public` (one anonymous snapshot: Server Components call the Backend directly with a 60 s cache, the browser goes through `app/api/catalog/public`). Admin edits show on the Site within ~60 s. Lists load up to 200 rows (Backend max page size) and `DataExplorer` searches/pages them client-side.
- SEO Settings, SEO Metadata, SEO Schema/JSON-LD (`features/seo`: `seo-settings.service.ts`, `seo-metadata.service.ts`, `seo-schema.service.ts`) and Redirects (`features/redirects`: `redirect.service.ts`) are backed by the Backend (`/seo/settings`, `/seo/metadata`, `/seo/schemas`, `/seo/redirects`, Backend `Seo` module). Metadata and schema overrides are keyed by `(entityType, entityId)` with `entityId` = the Backend id (Guid) of the product/category/article/page — never the slug. The Site reads settings/metadata/schema via `seo-public.service.ts` (server-only, `GET /seo/public/*`, 60 s cache, safe fallbacks) in `seo-resolver.service`, `app/robots.ts` and `app/sitemap.ts`. `middleware.ts` applies the active redirects via `redirect-public.service.ts` (Edge-safe, in-memory 60 s cache, fail-open). The whole SEO module is now Backend-backed — see `docs/proposals/seo-module.md`.
- Anything NOT yet in the Backend (Site testimonials, favorites, forgot-password, cart) is still mock/browser-only: `mocks/<name>.mock.ts` or a `localStorage` key behind a `services/<name>.service.ts`. Moving one to the Backend means rewriting only that service file. The shared `createMockStore` / `api-mode` helpers were removed with the Navigation mock — don't reintroduce them.
- Any new data-fetching/API-calling logic (mock or real) should follow this same pattern: a `services/<name>.service.ts` file inside the owning feature, never a raw `fetch()` inside a component.

### App Router structure

- [app/layout.tsx](app/layout.tsx) is the root layout: only `<html>`/`<body>` + global CSS imports (fonts → tokens → Tailwind base → shared component classes, in that order) + default metadata. It has no chrome and no providers — it is shared by both the User Site and the Admin Portal, so nothing customer- or admin-specific belongs here.
- [app/(site)/layout.tsx](app/(site)/layout.tsx) — User Site shell: renders `Header`/`Footer`/`FloatingActions` and wraps children in `AppProviders` (cart). The `(site)` route group does not affect URLs.
- Routes: `/` (home), `/thuc-don` (menu page), `/menu` (redirects to `/thuc-don`), `/checkout` — all under `app/(site)/`. Admin routes are under `app/admin/*` (see below).
- Pages import feature UI only via each feature's `index.ts` barrel (e.g. `import { MenuGrid } from "@/features/menu"`), never a deep path into the feature.
- Client components are explicitly marked with `"use client"` (context providers, cart/menu interactivity, animation wrappers); everything else defaults to Server Components per Next.js App Router convention.

### Admin Portal

- Routes live under `app/admin/*`, deliberately separate from `app/(site)/*` so the User Site's Header/Footer/CartProvider never leak into admin pages (and vice versa). [app/admin/layout.tsx](app/admin/layout.tsx) only provides `AdminAuthProvider` (from `features/admin-auth`); [app/admin/(auth)/login/page.tsx](app/admin/(auth)/login/page.tsx) renders unstyled by any dashboard chrome, while [app/admin/(dashboard)/layout.tsx](app/admin/(dashboard)/layout.tsx) adds the guarded shell (`AdminGuard` + `AdminSidebar` + `AdminHeader`, in `src/components/admin/layout/`) for every actual admin screen. `AdminSidebar` renders the caller's permission-filtered menu tree from the Backend (`GET /navigation/menus`, seeded by the Backend `NavigationSeeder`); a new admin page needs a menu entry there (seed or Admin → Hệ thống → Menu quản trị), not a code change in the sidebar. `middleware.ts` blocks `/admin/*` without the session cookie.
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
