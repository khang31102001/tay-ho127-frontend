# Bánh Cuốn Tây Hồ 127 — Frontend

> Next.js 14 + TypeScript + Tailwind CSS marketing/ordering website for a Vietnamese restaurant.

**Live Demo:** [tay-ho-127-nextjs-tailwind.vercel.app](https://tay-ho-127-nextjs-tailwind.vercel.app)

**Repository:** [khang31102001/tay-ho127-frontend](https://github.com/khang31102001/tay-ho127-frontend)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Main Modules (Features)](#main-modules-features)
6. [Prerequisites](#prerequisites)
7. [Environment Setup](#environment-setup)
8. [Installation](#installation)
9. [Development](#development)
10. [Build & Production](#build--production)
11. [Type Checking](#type-checking)
12. [Database & Backend](#database--backend)
13. [Linting & Code Quality](#linting--code-quality)
14. [Git Workflow](#git-workflow)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)
17. [Key Design Patterns](#key-design-patterns)
18. [Contributing](#contributing)

---

## 🎨 Overview

**Bánh Cuốn Tây Hồ 127** is a full-featured restaurant ordering platform with:

- **Customer Storefront:**
  - Menu browsing & filtering
  - Shopping cart with modifiers & special instructions
  - User authentication (login/register)
  - Checkout & order placement
  - News/blog section
  - Responsive design (mobile/tablet/desktop)

- **Admin Portal:**
  - User & role management
  - Permission-based access control
  - Menu/product catalog management
  - Order tracking
  - Brand profile & contact info
  - SEO metadata management
  - Navigation & content management

**Language:** Vietnamese (UI copy, comments, commit messages are in Vietnamese)

---

## 🏗️ System Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 14 Frontend                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────────────┐ │
│  │   Customer Site  │         │   Admin Portal           │ │
│  │  (app/(site)/)   │         │  (app/admin/)            │ │
│  │                  │         │                          │ │
│  │ - Home           │         │ - Dashboard              │ │
│  │ - Menu Browse    │         │ - Users CRUD             │ │
│  │ - Cart           │         │ - Roles & Permissions    │ │
│  │ - Checkout       │         │ - Navigation Management  │ │
│  │ - News/Articles  │         │ - SEO Settings           │ │
│  └──────────────────┘         │ - Orders Monitoring      │ │
│          │                    └──────────────────────────┘ │
│          │                              │                  │
└──────────┼──────────────────────────────┼──────────────────┘
           │                              │
           │ BFF Route Handlers           │
           │ (app/api/*)                  │
           │                              │
        ┌──┴──────────────────────────────┴──┐
        │  Backend API                       │
        │  (ASP.NET Core @ localhost:5140)   │
        │                                    │
        │  /customer/auth/*                  │
        │  /customer/menu/*                  │
        │  /customer/orders/*                │
        │  /admin/auth/*                     │
        │  /admin/users/*                    │
        │  /admin/navigation/*               │
        │  /admin/brand-profile/*            │
        │  ...                               │
        └────────────────────────────────────┘
```

### Feature-Based Architecture

This project uses **feature-based organization** where each business domain owns a self-contained folder:

```
src/features/<domain>/
  ├── components/          # React components (UI)
  ├── hooks/              # Custom React hooks
  ├── services/           # API calls & business logic (server-only where needed)
  ├── types/              # TypeScript interfaces/types
  ├── mocks/              # Mock data & fixtures
  ├── context/            # React context (state management)
  ├── utils/              # Utility functions
  └── index.ts            # PUBLIC BARREL (only export from here)
```

**Key Principle:** Other modules import features **only through the barrel** (`@/features/<domain>`), never directly from internal files (`@/features/<domain>/components/Internal.tsx`). This maintains clear ownership boundaries.

### Data Flow: Centralized Content

- **Brand Identity** (address, phone, hours, social links):
  - Managed by Admin at **Tổ chức → Thông tin thương hiệu / Chi nhánh**
  - Read via `getSiteBrand()` (server-only, `features/brand-profile/services/brand-public.service.ts`)
  - Passed as prop; formatted with `features/brand-profile/utils/site-contact.ts`
  - Empty value = hidden block

- **Navigation:**
  - Managed by Admin at `/admin/settings/navigation` (Site) or `/admin/system/menus` (Admin sidebar)
  - Read in `app/(site)/layout.tsx` via `services/public-navigation.service.ts` (60s cache)
  - Supports max 3 levels

- **Static Site Data:**
  - `src/data/site.ts` holds only display name, default tagline, static image paths
  - No contact info or dynamic content

### Theme Token Synchronization

Brand colors are defined in **TWO synchronized places** — both must be updated together:

1. **CSS Variables:** `src/styles/tokens.css`
   ```css
   :root {
     --brand-red-rgb: 237 28 36;
     --brand-green-rgb: 47 107 58;
     /* ... etc */
   }
   ```

2. **Tailwind Config:** `tailwind.config.ts`
   ```typescript
   colors: {
     brand: {
       red: "rgb(var(--brand-red-rgb) / <alpha-value>)",
       green: "rgb(var(--brand-green-rgb) / <alpha-value>)",
       /* ... etc */
     }
   }
   ```

---

## 💻 Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js (App Router) | ^14.2.30 |
| **Language** | TypeScript | ^6.0.3 |
| **Styling** | Tailwind CSS | ^3.4.17 |
| **UI Components** | Lucide React | ^1.24.0 |
| **Rich Text** | Tiptap (ProseMirror) | ^3.30.5 |
| **Carousel** | Swiper | ^14.1.0 |
| **Animation** | Motion | ^12.42.2 |
| **HTML Sanitize** | sanitize-html | ^2.18.0 |
| **CSS Compiler** | PostCSS, Autoprefixer | ^10.4.20 |
| **Linting** | ESLint (Next.js config) | ^8.57.1 |
| **Formatting** | Prettier | ^3.3.3 |
| **Type Checker** | TypeScript (via `next build`) | (built-in) |

**Note:** No test runner is configured; type-checking runs via `tsc` through `next build`.

---

## 📁 Project Structure

### Root Files

```
tay-ho127-frontend/
├── package.json              # Dependencies, scripts
├── tsconfig.json             # TypeScript compiler options (path alias: @/*)
├── next.config.mjs           # Next.js config (image optimization, redirects)
├── tailwind.config.ts        # Tailwind theme (extends with brand colors, fonts)
├── .eslintrc.json            # ESLint config (extends next/core-web-vitals)
├── .env.example              # Environment template
├── .gitignore                # Git ignore patterns
├── CLAUDE.md                 # Developer guidance & architecture notes
└── README.md                 # This file
```

### App Directory (`app/`)

Next.js App Router pages and layouts:

```
app/
├── layout.tsx                # Root layout (HTML, CSS imports, metadata defaults)
├── globals.css               # Global Tailwind + CSS reset
├── (site)/
│   ├── layout.tsx           # Site layout (header, footer, cart provider)
│   ├── page.tsx             # Homepage
│   ├── thuc-don/
│   │   └── page.tsx         # Menu browsing page
│   ├── tin-tuc/
│   │   ├── page.tsx         # News listing
│   │   └── [slug]/
│   │       └── page.tsx     # News detail page
│   ├── gio-hang/
│   │   └── page.tsx         # Shopping cart
│   ├── thanh-toan/
│   │   └── page.tsx         # Checkout
│   ├── account/
│   │   └── [section]/
│   │       └── page.tsx     # Customer account pages
│   └── api/
│       ├── customer/auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   ├── logout/route.ts
│       │   └── session/route.ts
│       └── customer/
│           └── [other]/route.ts
├── admin/
│   ├── layout.tsx           # Admin layout (sidebar, auth guard)
│   ├── page.tsx             # Admin dashboard
│   ├── (dashboard)/
│   │   ├── users/          # User CRUD
│   │   ├── roles/          # Role CRUD
│   │   ├── orders/         # Orders monitoring
│   │   ├── navigation/     # Navigation management
│   │   ├── seo/            # SEO settings
│   │   └── ...
│   └── api/
│       ├── admin/auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── session/route.ts
│       └── admin/
│           └── [other]/route.ts
└── (system)/
    └── [catchall pages like 404, 500]/
```

### Source Directory (`src/`)

```
src/
├── features/                 # FEATURE MODULES (centralized ownership)
│   ├── auth/                 # Customer auth (login/register/session)
│   ├── admin-auth/           # Admin auth (separate by design)
│   ├── menu/                 # Menu browse/filter UI
│   ├── cart/                 # Cart context + UI
│   ├── checkout/             # Checkout page logic
│   ├── orders/               # Order management
│   ├── home/                 # Homepage sections (hero, testimonials)
│   ├── news/                 # News/articles
│   ├── brand-profile/        # Brand info (address, phone, hours)
│   ├── navigation/           # Site menus + admin sidebar
│   ├── seo/                  # SEO metadata & schema management
│   ├── users/                # Admin user CRUD
│   ├── roles/                # Admin role CRUD
│   ├── permissions/          # Permission tree
│   └── [other features]/
│
├── lib/                      # Utilities & helpers
│   ├── auth/
│   │   ├── customer-backend-session.ts
│   │   └── admin-backend-session.ts
│   ├── http/
│   │   └── api-client.ts     # Fetch wrapper
│   ├── seo/                  # SEO utilities
│   ├── image-hosts.ts        # CDN host configuration
│   ├── site-url.ts           # URL resolution
│   └── ...
│
├── components/               # Shared UI components
│   ├── shared/              # Generic components (Reveal, Container)
│   ├── ui/                  # Basic UI primitives (Button, Input, Modal)
│   └── layouts/             # Layout wrappers
│
├── hooks/                    # Custom React hooks
│   ├── useScrollThreshold.ts
│   ├── useMediaQuery.ts
│   └── ...
│
├── styles/
│   ├── tokens.css           # CSS variables (brand colors, fonts)
│   ├── fonts.css            # @font-face declarations
│   ├── components.css       # Tailwind @apply utilities
│   └── globals.css          # (in app/ directory)
│
├── data/
│   ├── site.ts              # Static site data
│   └── ...
│
├── config/                  # Configuration
│   └── [config files]
│
├── provider/                # React context providers
│   └── ...
│
└── types/                   # Global TypeScript types
    └── [shared types]
```

### Public Directory (`public/`)

Static assets served from root:

```
public/
├── images/                  # Logos, photos, icons
│   ├── logo-color.png
│   ├── logo-white.png
│   ├── hero-platter.png
│   ├── banh-cuon-dish.jpg
│   ├── michelin-2026.png
│   ├── google-logo.png
│   ├── background-menu.png
│   └── background-checkout.png
└── fonts/                   # Local font files (user must add)
    ├── Roboto-VariableFont_wdth,wght.ttf
    ├── Roboto-Italic-VariableFont_wdth,wght.ttf
    ├── PS-Anton-Regular-V1.0.otf
    ├── MyriadPro-Regular.otf
    ├── KozGoPr6N-Regular.otf
    └── README.md            # Font instructions
```

---

## 🎯 Main Modules (Features)

### Core Customer Features

| Feature | Location | Purpose | Key Exports |
|---------|----------|---------|------------|
| **Auth** | `src/features/auth/` | Customer login/register/session | `AuthProvider`, `useAuth`, `AuthModal` |
| **Menu** | `src/features/menu/` | Browse/filter menu, product cards | `MenuGrid`, `ProductCard`, `MenuHero` |
| **Cart** | `src/features/cart/` | Cart context + UI, fly-to-cart animation | `CartProvider`, `useCart`, `MiniCart` |
| **Checkout** | `src/features/checkout/` | Checkout page, order submission | `CheckoutForm`, `useCheckoutForm` |
| **Orders** | `src/features/orders/` | Order tracking & history | `OrderList`, `OrderDetail` |
| **Home** | `src/features/home/` | Homepage sections (hero, testimonials) | `TopHero`, `TestimonialsSection`, `StatsSection` |
| **News** | `src/features/news/` | Blog/news articles | `NewsCard`, `NewsGrid`, `NewsDetail` |

### Admin Features

| Feature | Location | Purpose | Key Exports |
|---------|----------|---------|------------|
| **Admin Auth** | `src/features/admin-auth/` | Admin login/session (separate from customer) | `AdminAuthProvider`, `useAdminAuth` |
| **Users** | `src/features/users/` | Admin user CRUD | `UserEditor`, `UserList`, `useUserEditor` |
| **Roles** | `src/features/roles/` | Role CRUD & permission assignment | `RoleEditor`, `RoleList` |
| **Permissions** | `src/features/permissions/` | Permission tree CRUD | `PermissionTree`, `usePermission` |
| **Navigation** | `src/features/navigation/` | Manage Site menus + admin sidebar | `NavigationManager`, `MenuEditor` |
| **SEO** | `src/features/seo/` | SEO metadata & JSON-LD schema | `SeoDashboard`, `SeoEditor`, `useSeoMetadataForm` |

### Infrastructure Features

| Feature | Location | Purpose | Key Exports |
|---------|----------|---------|------------|
| **Brand Profile** | `src/features/brand-profile/` | Brand info (read from Backend) | `getSiteBrand`, `formatBrandAddress`, `getContactPhone` |
| **Media** | `src/features/media/` | Image/file management (Backend library) | (TBD) |
| **Articles** | `src/features/articles/` | Article management (Backend) | (TBD) |

---

## 📋 Prerequisites

- **Node.js:** v18+ (LTS recommended)
- **npm:** v9+ or **yarn** v3+
- **Backend API:** Running at `http://localhost:5140` (ASP.NET Core)
- **Browser:** Modern browser with ES2017+ support

---

## 🔧 Environment Setup

### 1. Create `.env.local`

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

### 2. Environment Variables

**`.env.local`** (never commit, Git-ignored):

```env
# Frontend API URL for customer/admin site features (defaults to relative path)
# Example: NEXT_PUBLIC_API_URL=https://api.tayho127.com
NEXT_PUBLIC_API_URL=

# Backend ASP.NET Core origin (admin BFF calls) — SERVER-ONLY, never exposed to browser
# Required for Admin Portal authentication
# Local: http://localhost:5140
BACKEND_API_URL=http://localhost:5140

# Remote image hosts allowed by <Image /> optimization (comma-separated)
# Example: NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=cdn.tayho127.vn,res.cloudinary.com
NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=
```

### 3. Font Setup

Local fonts are not bundled (licensing). Add to `public/fonts/`:

1. Copy fonts with **correct names** to `public/fonts/`:
   - `Roboto-VariableFont_wdth,wght.ttf`
   - `Roboto-Italic-VariableFont_wdth,wght.ttf`
   - `PS-Anton-Regular-V1.0.otf`
   - `MyriadPro-Regular.otf`
   - `KozGoPr6N-Regular.otf`

2. Fonts are declared in `src/styles/fonts.css` and referenced in `src/styles/tokens.css`

3. If fonts are missing, the site still runs with fallback fonts (glyph appearance may differ)

See `public/fonts/README.md` for details.

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/khang31102001/tay-ho127-frontend.git
cd tay-ho127-frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Start Backend (Optional for Dev)

```bash
# Backend must run separately at http://localhost:5140
# This repo has no backend code — see related ASP.NET Core repo
```

---

## 🚀 Development

### Start Dev Server

```bash
npm run dev
# or
npm run app     # alias
```

**Output:**
```
> next dev
  ▲ Next.js 14.2.30
  - Local:        http://localhost:3000
  - Environments: .env.local
  ✓ Ready in 2.5s
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Dev Server Features

- **Fast Refresh:** Code changes reflect instantly without full page reload
- **App Router Hot Reload:** Page and layout changes update in real time
- **TypeScript Errors:** Caught and shown in terminal + browser console
- **ESLint Warnings:** Displayed in terminal during compilation

### File Watching & Compilation

- `src/` and `app/` directories are watched automatically
- Tailwind CSS is compiled on-demand
- CSS custom properties and theme tokens are applied in real-time

---

## 🏗️ Build & Production

### Build for Production

```bash
npm run build
```

**Outputs:**
- `.next/` — Optimized build artifacts
- Next.js performs:
  - TypeScript type-checking (via `tsc`)
  - ESLint code analysis
  - Tailwind CSS purging (unused classes removed)
  - Next.js optimizations (image optimization, code splitting)

### Start Production Server

```bash
npm run start
```

Serves the production build on [http://localhost:3000](http://localhost:3000)

### Deployment Preview (Vercel)

```bash
# Preview before pushing to main
vercel
```

---

## ✅ Type Checking

Type-checking runs **automatically** during `npm run build`:

```bash
# Explicit type-check (no separate script)
npx tsc --noEmit
```

- **Config:** `tsconfig.json` (strict mode enabled)
- **Path alias:** `@/*` maps to `src/*`
- **Type errors block build:** Ensure all TypeScript errors are resolved

---

## 🗄️ Database & Backend

**This repository is FRONTEND ONLY.** No database code or migrations exist here.

### Backend Communication

- **Pattern:** Backend-For-Frontend (BFF) via route handlers
- **Location:** `app/api/*` (server-side Next.js API routes)
- **API Client:** `src/lib/http/api-client.ts`

### Backend API Routes (Mock/Real)

| Route | Purpose | Backend Endpoint |
|-------|---------|------------------|
| `POST /api/customer/auth/login` | Customer login | `POST /customer/auth/login` |
| `POST /api/customer/auth/register` | Customer register | `POST /customer/auth/register` |
| `POST /api/customer/auth/logout` | Customer logout | `POST /customer/auth/logout` |
| `GET /api/customer/session` | Fetch customer session | (HttpOnly cookie) |
| `GET /api/admin/auth/session` | Fetch admin session | (HttpOnly cookie) |
| `POST /api/admin/auth/login` | Admin login | `POST /admin/auth/login` |
| `POST /api/admin/auth/logout` | Admin logout | `POST /admin/auth/logout` |

### Mock Data

While backend is being developed, some features use mock data:

- **Menu:** `src/features/menu/mocks/menu-api-response.mock.json`
- **Testimonials:** `src/features/home/mocks/testimonials.mock.ts`
- **Promotions:** `src/features/promotions/mocks/promotions.mock.ts`

Mock files are prefixed with `.mock.ts` or `.mock.json` and are replaced during backend integration.

---

## 🔍 Linting & Code Quality

### ESLint

```bash
npm run lint
```

Config: `.eslintrc.json` (extends `next/core-web-vitals`)

Checks for:
- React best practices (`react/`, `react-hooks/`)
- Next.js specific rules (`@next/next/`)
- Core Web Vitals rules

### Formatting (Prettier)

```bash
# Format code (optional, no npm script)
npx prettier --write src/ app/
```

Config: `.prettierrc` (if present, defaults to Prettier standard)

### Type Safety

TypeScript strict mode is **enabled** in `tsconfig.json`:

```typescript
"strict": true,
"noImplicitAny": true,
"noImplicitThis": true,
```

---

## 🌳 Git Workflow

### Branch Naming

```
feature/<feature-name>    # New features
bugfix/<bug-name>         # Bug fixes
docs/<section>            # Documentation
refactor/<area>           # Refactoring
chore/<task>              # Maintenance
```

### Commit Messages

Commit messages are largely in **Vietnamese** to match the codebase. Examples:

```
feat: Thêm modal đăng nhập khách hàng
fix: Sửa lỗi tính toán giỏ hàng
docs: Cập nhật README kiến trúc
refactor: Tách component UserList thành 3 component nhỏ
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and commit
3. Push branch and open PR
4. Ensure:
   - `npm run lint` passes
   - `npm run build` succeeds (TypeScript check included)
   - PR description explains **what** and **why**
5. Request review
6. Merge when approved

---

## 🚢 Deployment

### Vercel (Current)

**Production:** [tay-ho-127-nextjs-tailwind.vercel.app](https://tay-ho-127-nextjs-tailwind.vercel.app)

#### Deploy Steps

1. **Push to main:**
   ```bash
   git push origin main
   ```

2. **Vercel Auto-Deploy:**
   - Vercel automatically builds & deploys
   - Check status at [Vercel Dashboard](https://vercel.com)

3. **Environment Variables:**
   - Set in Vercel Project Settings → Environment Variables
   - Must include: `BACKEND_API_URL`, `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS`

#### Manual Deploy

```bash
npm run build
vercel deploy --prod
```

### Self-Hosted (Docker)

**Dockerfile:** Not yet provided; add as needed

```dockerfile
# Example (Needs confirmation)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build
ENV NODE_ENV=production
CMD ["npm", "start"]
EXPOSE 3000
```

---

## 🆘 Troubleshooting

### Dev Server Won't Start

**Problem:** `npm run dev` fails or port 3000 in use

**Solution:**
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors in Build

**Problem:** `npm run build` fails with type errors

**Solution:**
```bash
# Check all errors
npm run build 2>&1 | head -50

# Fix errors listed, then rebuild
npm run build
```

### Styles Not Applying (Missing Fonts)

**Problem:** Glyph appearance incorrect or fonts look wrong

**Solution:**
1. Verify font files in `public/fonts/` match names in `src/styles/fonts.css`
2. Restart dev server: `npm run dev`
3. Hard-refresh browser (Cmd/Ctrl+Shift+R)

### Cart/Auth Data Not Persisting

**Problem:** Session lost on page refresh

**Note:** Depending on backend status:
- Customer auth: Stored in HttpOnly cookie (secure, auto-managed)
- Cart: Stored in localStorage (cleared if browser storage disabled)

### Image Optimization Errors

**Problem:** `Error: Invalid hostname` for CDN images

**Solution:**
1. Verify `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` environment variable is set
2. Format: comma-separated hostnames, no protocol
   ```env
   NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=cdn.tayho127.vn,res.cloudinary.com
   ```
3. Restart dev server

### API Calls Failing

**Problem:** 404 or network errors from `app/api/*` routes

**Solution:**
1. Verify `BACKEND_API_URL=http://localhost:5140` in `.env.local`
2. Backend must be running and accessible
3. Check CORS headers if calling real backend

---

## 🏛️ Key Design Patterns

### 1. Feature-Based Architecture

Each domain owns its folder with clear public API (barrel export):

```typescript
// ✅ CORRECT: Import from barrel
import { CartProvider, useCart } from "@/features/cart";

// ❌ WRONG: Direct import from internal file
import { CartProvider } from "@/features/cart/context/cart-context";
```

### 2. Server-Only Services

Backend calls stay in `services/*.service.ts`, never leak to client:

```typescript
// ✅ CORRECT: Service is server-only
// src/features/brand-profile/services/brand-public.service.ts
export async function getSiteBrand(): Promise<SiteBrand> {
  // Called in app/(site)/layout.tsx (server)
}

// ❌ WRONG: Don't export server service through barrel if used by "use client"
// src/features/seo/index.ts
export { getSeoSettings }; // If component is "use client", this breaks bundling
```

### 3. Theme Token Synchronization

Brand colors MUST be updated in both places:

```css
/* src/styles/tokens.css */
:root {
  --brand-red-rgb: 237 28 36;
}
```

```typescript
// tailwind.config.ts
colors: {
  brand: {
    red: "rgb(var(--brand-red-rgb) / <alpha-value>)",
  }
}
```

### 4. Centralized Content

Never hard-code brand info, navigation, or menu in components:

```typescript
// ✅ CORRECT: Fetch from backend
const brand = await getSiteBrand();
const phone = getContactPhone(brand); // Formats and hides if empty

// ❌ WRONG: Hard-coded
const phone = "0932 123 456";
```

### 5. Cart Item Uniqueness

Cart items are keyed by modifiers, not just product ID:

```typescript
// Same product, different modifiers = different cart line
const cartItemId = buildCartItemId(productId, modifiers);
// Without modifiers: cartItemId === productId (merge behavior)
```

### 6. SEO Fallback Hierarchy

SEO metadata follows a priority order:

1. **Override** (Admin entered explicitly)
2. **Entity Default** (from Product/Article name/description)
3. **Global SEO Settings** (site-wide defaults)

---

## 📝 Contributing

### Code Style

- **Language:** TypeScript (strict mode)
- **Comments:** Vietnamese
- **Formatting:** Prettier (implicit via ESLint)
- **Component Format:** Functional components with hooks

### Adding a New Feature

1. **Create folder** in `src/features/<domain>/`
2. **Structure:**
   ```
   src/features/<domain>/
   ├── components/
   ├── hooks/
   ├── services/
   ├── types/
   ├── mocks/
   ├── utils/
   └── index.ts (barrel)
   ```
3. **Export public API** from `index.ts` barrel only
4. **Add types** to `types/` folder (never inline)
5. **Test imports:** Ensure `@/features/<domain>` works from other modules

### Updating Brand Colors

1. Edit `src/styles/tokens.css` (CSS variables)
2. Edit `tailwind.config.ts` (Tailwind mappings)
3. Test: `npm run dev`, verify colors in browser
4. Commit both files together

### Updating Navigation/Menus

- Site menus: Managed via Admin Portal (`/admin/settings/navigation`)
- Admin sidebar: Managed via Admin Portal (`/admin/system/menus`)
- **Do NOT hard-code** menu items in components

---

## 📚 Additional Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **TypeScript Docs:** https://www.typescriptlang.org/docs
- **Vercel Deployment:** https://vercel.com/docs
- **Architecture Guide:** See `CLAUDE.md` (detailed notes for developers)

---

## 📧 Support & Questions

For questions or issues:
1. Check this README & `CLAUDE.md`
2. Search existing GitHub issues
3. Open a new issue with:
   - Clear description of problem
   - Steps to reproduce
   - Environment (Node version, OS, etc.)
   - Error logs/screenshots

---

**Last Updated:** October 2026  
**Maintained by:** khang31102001
