# Architecture Documentation

## Overview

Tây Hộ 127 Frontend sử dụng **Domain-Driven Design (DDD)** architecture với Next.js, tách biệt rõ ràng giữa platform infrastructure (`core/`), business logic (`features/`), reusable components (`shared/`), và routing (`app/`).

## Layer Architecture

### Core Layer (`src/core/`)

**Purpose:** Platform-level infrastructure không phụ thuộc vào business logic.

**Modules:**

#### 1. `core/api/`
- **Exports:** `createHttpClient`, `api`, `adminApi`, `ApiError`, `setAuthTokenProvider`
- **Types:** `HttpClient`, `HttpMethod`, `ApiEnvelope`, `ApiRequestOptions`, `ErrorKind`
- **Responsibility:**
  - Generic HTTP wrapper (fetch, headers, timeout, retry logic)
  - Error handling & normalization (ApiError class)
  - Request/response parsing
  - Pre-configured clients for different backends

**Usage:**
```typescript
import { adminApi, ApiError } from '@/core/api';

try {
  const users = await adminApi.get('/users');
} catch (error) {
  if (error instanceof ApiError && error.kind === 'unauthorized') {
    // redirect to login
  }
}
```

#### 2. `core/auth/`
- **Exports:** `getCustomerSession`, `getAdminSession`, `refreshCustomerSession`, `refreshSession`, `readCustomerTokens`, `readSessionTokens`, `writeCustomerCookies`, `writeSessionCookies`, `fetchBackendAsCustomer`, `fetchBackendAsAdmin`
- **Types:** `CustomerSessionUser`, `AdminSessionUser`, `CustomerSessionTokens`, `AdminSessionTokens`
- **Responsibility:**
  - Server-only session management
  - Cookie read/write (HttpOnly, secure)
  - Token refresh logic with deduplication
  - BFF authentication flow

**Usage (Server Component/Route Handler):**
```typescript
import { fetchBackendAsAdmin } from '@/core/auth';

export async function GET(request: NextRequest) {
  const { response, tokens, unauthenticated } = await fetchBackendAsAdmin(
    request,
    '/users'
  );
  
  if (unauthenticated) {
    return NextResponse.redirect('/admin/login');
  }
  
  // ...
}
```

#### 3. `core/config/`
- **Exports:** `getSiteUrl`, `getRemoteImageHosts`, `APP_CONSTANTS`
- **Responsibility:**
  - Environment variable resolution
  - Site URL (for metadataBase, canonical, etc)
  - Image host whitelist (for next/image)
  - App-wide constants (timeouts, paths, limits)

**Usage:**
```typescript
import { getSiteUrl, APP_CONSTANTS } from '@/core/config';

const siteUrl = getSiteUrl(); // https://www.example.com
const timeout = APP_CONSTANTS.DEFAULT_TIMEOUT_MS; // 15000
```

#### 4. `core/security/`
- **Exports:** `sanitizeHtml`, `validateEmail`, `validateUrl`
- **Responsibility:**
  - XSS prevention (HTML sanitization)
  - Input validation helpers
  - CSRF protection (if needed)

**Usage:**
```typescript
import { sanitizeHtml, validateEmail } from '@/core/security';

const clean = sanitizeHtml(userContent);
if (validateEmail(email)) {
  // proceed
}
```

#### 5. `core/utils/`
- **Exports:** `cn`, `slugify`, `normalizeText`, `formatCurrency`, `formatFileSize`
- **Responsibility:**
  - Generic string utilities
  - Number formatting
  - Classname utilities
  - File size formatting

**Usage:**
```typescript
import { cn, formatCurrency, slugify } from '@/core/utils';

const className = cn('btn', { 'btn-primary': isPrimary });
const price = formatCurrency(1500); // "1.500 ₫"
const slug = slugify('Sản Phẩm Đặc Biệt'); // "san-pham-dac-biet"
```

### Features Layer (`src/features/<domain>/`)

**Purpose:** Domain-driven business logic organized by feature/domain.

**Domains:**

#### `features/catalog/`
**Manages:** Products, categories, menus

**Structure:**
```
catalog/
├── admin/
│   ├── ProductsExplorer.tsx
│   ├── ProductEditor.tsx
│   ├── CategoriesExplorer.tsx
│   ├── CategoriesEditor.tsx
│   └── index.ts
├── site/
│   ├── ProductBrowse.tsx
│   ├── ProductDetail.tsx
│   ├── CatalogFilter.tsx
│   └── index.ts
├── services/
│   ├── public-catalog.service.ts
│   └── admin-catalog.service.ts
├── types/
│   └── catalog.types.ts
└── index.ts
```

**API Integration:**
```typescript
// services/admin-catalog.service.ts
import { adminApi } from '@/core/api';

export async function getProducts(pageSize = 200) {
  return adminApi.get('/products', { params: { pageSize } });
}

export async function createProduct(data: CreateProductRequest) {
  return adminApi.post('/products', data);
}
```

**Feature Export:**
```typescript
// index.ts
export * from './admin';
export * from './site';
export * from './services/public-catalog.service';
export * from './services/admin-catalog.service';
export type { Product, Category, Menu } from './types/catalog.types';
```

#### `features/content/`
**Manages:** Articles, pages, banners, categories, tags

#### `features/payments/`
**Manages:** Payment methods, payment sessions, payment confirmations

#### `features/access-control/`
**Manages:** Users, roles, permissions

#### `features/organization/`
**Manages:** Company info, brand profile, departments

#### `features/orders/`
**Manages:** Orders, order tracking, order history

#### `features/navigation/`
**Manages:** Main navigation, menu items

#### `features/media/`
**Manages:** File uploads, media library

#### `features/auth/`
**Manages:** Customer login/register (site)

#### `features/admin-auth/`
**Manages:** Admin login (portal)

#### `features/cart/`
**Manages:** Shopping cart state (client-side context)

#### `features/checkout/`
**Manages:** Checkout flow, payment integration

#### Other Features
- `features/home/` - Homepage
- `features/favorites/` - Wishlist
- `features/seo/` - SEO metadata
- `features/redirects/` - URL redirects

### Shared Layer (`src/shared/`)

**Purpose:** Reusable components, hooks, and types used across multiple features.

**Contents:**

#### `shared/ui/`
- Button, Input, Modal, Badge, Spinner, Card, Tabs, Dropdown

#### `shared/components/`
- StatusPopup, Reveal, LanguageSwitcher, Breadcrumb

#### `shared/hooks/`
- `useAsyncData` - Fetch data with loading/error states
- `useScrollThreshold` - Detect scroll position
- `usePagination` - Pagination state management

#### `shared/types/`
- `CommonQuery` - Standard query params (search, page, pageSize, sort)
- `CommonResponse<T>` - Standard paginated response

**Usage:**
```typescript
import { Button, Input } from '@/shared/ui';
import { useAsyncData, usePagination } from '@/shared/hooks';
import type { CommonQuery, CommonResponse } from '@/shared/types';

export function ProductList() {
  const { page, pageSize, goToPage } = usePagination();
  const query: CommonQuery = { page, pageSize };
  const { data, loading } = useAsyncData(() => getProducts(query));
  
  return (
    <div>
      {loading ? <Spinner /> : null}
      {/* render data */}
    </div>
  );
}
```

### Layout Layer (`src/layout/`)

**Purpose:** App shells (not reusable components).

**Contents:**

#### `layout/site/`
- SiteLayout wrapper
- Header, Footer, MobileMenu

#### `layout/admin/`
- AdminLayout wrapper
- AdminSidebar, AdminHeader

**Usage (in app routes):**
```typescript
// app/(site)/page.tsx
import { SiteLayout } from '@/layout/site';

export default function HomePage() {
  return (
    <SiteLayout>
      <HomeHero />
      <HomeFeaturedProducts />
    </SiteLayout>
  );
}
```

### App Layer (`src/app/`)

**Purpose:** Next.js routes, pages, API handlers.

**Structure:**
```
app/
├── (site)/
│   ├── layout.tsx
│   ├── page.tsx (homepage)
│   ├── thuc-don/page.tsx
│   ├── tin-tuc/page.tsx
│   ├── [slug]/page.tsx
│   ├── gio-hang/page.tsx
│   ├── thanh-toan/page.tsx
│   └── api/
│       ├── customer/
│       │   ├── auth/
│       │   │   ├── login/route.ts
│       │   │   ├── register/route.ts
│       │   │   ├── logout/route.ts
│       │   │   └── session/route.ts
│       │   └── ...
│       └── sales/
│           └── ...
├── admin/
│   ├── layout.tsx
│   ├── page.tsx (dashboard)
│   ├── users/page.tsx
│   ├── products/page.tsx
│   ├── orders/page.tsx
│   └── api/
│       ├── admin/
│       │   ├── auth/
│       │   │   ├── login/route.ts
│       │   │   ├── logout/route.ts
│       │   │   └── session/route.ts
│       │   └── ...
│       └── backend/
│           └── [...path]/route.ts (BFF proxy)
├── layout.tsx (root)
├── providers.tsx
└── config/
    ├── metadata.ts
    └── app-config.ts
```

**API Route Example (BFF):**
```typescript
// app/api/admin/backend/[...path]/route.ts
import { fetchBackendAsAdmin } from '@/core/auth';

export async function GET(request: NextRequest) {
  const { response, tokens, unauthenticated } = await fetchBackendAsAdmin(
    request,
    `/api/v1${path}`
  );
  
  if (unauthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (tokens) {
    const res = NextResponse.next();
    writeSessionCookies(res, tokens);
    return res;
  }
  
  return response;
}
```

## Dependency Rules

### Allowed ✅
- `app/ → features/`
- `app/ → shared/`
- `app/ → layout/`
- `app/ → core/`
- `features/ → core/`
- `features/ → shared/`
- `features/ → (other) features/` (via barrel export)
- `shared/ ↔ shared/` (cross-reference)
- `layout/ → shared/`
- `layout/ → core/`

### Forbidden ❌
- `core/ → features/` (core must not depend on business logic)
- `core/ → app/`
- `core/ → shared/` (only exception: core can use shared types, but should avoid)
- `shared/ → features/` (shared must be feature-agnostic)
- `shared/ → core/` (shared should not depend on infrastructure)

## State Management

### Server State
- Managed by `core/auth/` (session tokens)
- Fetched via API from `features/*/services/`

### Client State
- Feature-specific: Use `useState` or feature context (e.g., CartContext in features/cart/)
- Cross-feature: Use `shared/hooks/` (e.g., useAsyncData)

### Global State
- Use React Context or Zustand store (if needed)
- Keep in relevant feature or shared layer

## Testing Strategy

### Unit Tests
- `src/core/**/*.test.ts` - Core utilities, error handling
- `src/features/**/services/*.test.ts` - Service logic

### Integration Tests
- `src/features/**/integration.test.ts` - Feature workflows

### E2E Tests
- `e2e/` - User flows (Playwright, Cypress, etc)

## Performance Considerations

### Code Splitting
- Each feature is isolated → can be lazy-loaded
- Use dynamic imports for heavy features

### Bundle Size
- Core layer is small and always included
- Shared components are reusable (small overhead)
- Features are domain-specific

### Caching
- Use SWR or React Query for data fetching
- Set cache headers on API responses
- Use Next.js Image for optimization

## Scalability

### Adding a New Feature
1. Create `src/features/my-feature/`
2. Structure: `admin/`, `site/`, `services/`, `types/`
3. Create barrel export `index.ts`
4. Import in routes/pages as needed
5. No changes to core or shared

### Adding a New Core Utility
1. Create in appropriate `src/core/*/` subfolder
2. Export from module `index.ts`
3. Update `src/core/index.ts` if needed
4. Available globally

### Refactoring
- Core layer: Backward compatible (many dependents)
- Features: Can refactor within domain
- Shared: Handle with care (used everywhere)

## Common Patterns

### Fetching Data in Feature
```typescript
// features/catalog/services/admin-catalog.service.ts
import { adminApi } from '@/core/api';

export async function getProducts(pageSize: number = 200) {
  return adminApi.get('/products', { params: { pageSize } });
}

// features/catalog/admin/ProductsExplorer.tsx
'use client';
import { useAsyncData } from '@/shared/hooks';
import { getProducts } from '../services/admin-catalog.service';

export function ProductsExplorer() {
  const { data, loading } = useAsyncData(getProducts);
  return <div>{loading ? 'Loading...' : 'Products'}</div>;
}
```

### Server Component with Auth
```typescript
// app/admin/users/page.tsx
import { getAdminSession, fetchBackendAsAdmin } from '@/core/auth';

export default async function AdminUsersPage(request: NextRequest) {
  const session = await getAdminSession(request);
  
  if (!session) {
    return redirect('/admin/login');
  }
  
  const { response } = await fetchBackendAsAdmin(request, '/users');
  const users = await response.json();
  
  return <div>{/* render users */}</div>;
}
```

### Shared UI Component
```typescript
// shared/ui/Button.tsx
'use client';

export function Button({ 
  children, 
  variant = 'primary',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
}

// features/catalog/admin/ProductEditor.tsx
import { Button } from '@/shared/ui';

export function ProductEditor() {
  return <Button variant="primary">Save Product</Button>;
}
```

## Troubleshooting

### Import Error: "Cannot find module '@/core/auth'"
**Solution:** Check that session type is available and exported from `core/auth/index.ts`

### Feature doesn't have access to API response
**Solution:** Import from feature services layer, not directly from core/api

### Circular dependency warning
**Solution:** Check dependency graph (features → shared/core → nothing) and reorganize

### Type not found in shared
**Solution:** Types for domain-specific logic belong in feature layer, not shared

## References

- [Domain-Driven Design - Evans](https://www.domainlanguage.com/ddd/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Best Practices](https://react.dev/)
