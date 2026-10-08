# Kiến Trúc Tay Hộ 127

## Tổng Quan

Dự án **Tây Hộ 127 Frontend** là một ứng dụng Next.js hiện đại với kiến trúc domain-driven, tách biệt rõ ràng giữa infrastructure, business logic, và UI.

## Cây Dự Án

```
src/
├── app/                    # Next.js routes & bootstrap
├── core/                   # Platform infrastructure (không phụ thuộc business logic)
│   ├── api/               # HTTP clients & error handling
│   ├── auth/              # Session management (server-only)
│   ├── config/            # Environment & constants
│   ├── security/          # Sanitization & validation
│   └── utils/             # Generic utilities (string, format, etc)
├── features/              # Domain-driven business logic
│   ├── catalog/          # Products, categories, menus
│   ├── content/          # Articles, pages, banners
│   ├── payments/         # Payment methods & processing
│   ├── access-control/   # Users, roles, permissions
│   ├── organization/     # Brand & company info
│   ├── navigation/       # Menu & navigation
│   ├── orders/           # Order management
│   ├── seo/              # SEO metadata
│   ├── media/            # File upload & management
│   ├── cart/             # Shopping cart state
│   ├── checkout/         # Checkout flow
│   ├── auth/             # Customer auth (site)
│   ├── admin-auth/       # Admin auth (portal)
│   ├── home/             # Homepage components
│   ├── favorites/        # Wishlist/favorites
│   └── redirects/        # URL redirects
├── shared/               # Reusable UI & hooks
│   ├── ui/              # Button, Input, Modal, etc
│   ├── components/      # StatusPopup, Breadcrumb, etc
│   ├── hooks/           # useAsyncData, usePagination, etc
│   └── types/           # Common types (CommonQuery, etc)
├── layout/              # App shells (not components)
│   ├── site/           # Site layout & chrome
│   └── admin/          # Admin portal layout
└── styles/             # Global CSS
```

## Kiến Trúc Lớp (Layers)

### 1. **core/** - Platform Infrastructure

**Trách nhiệm:**
- HTTP client, error handling, request/response parsing
- Session management (read/write cookies, token refresh)
- Environment config, site URL, image hosts
- Security (HTML sanitize, email validation)
- Generic utilities (string format, currency, etc)

**Đặc điểm:**
- ❌ KHÔNG phụ thuộc vào business domain
- ✅ Ổn định, tái sử dụng cao
- ✅ Import từ `@/core`

```typescript
import { api, adminApi } from '@/core/api';
import { getCustomerSession } from '@/core/auth';
import { getSiteUrl } from '@/core/config';
import { sanitizeHtml } from '@/core/security';
import { cn, formatCurrency } from '@/core/utils';
```

### 2. **features/** - Business Domains

**Tổ chức theo domain:**
- `catalog/` - Sản phẩm, danh mục, thực đơn
- `content/` - Bài viết, trang, banner
- `payments/` - Thanh toán, phương thức thanh toán
- `access-control/` - Người dùng, vai trò, quyền
- `organization/` - Thông tin công ty
- `navigation/` - Điều hướng
- `orders/` - Đơn hàng
- `seo/` - SEO metadata
- `media/` - Tải file lên

**Cấu trúc của mỗi feature domain:**
```
features/<domain>/
├── admin/                 # Admin UI components
├── site/                  # Site UI components (nếu có)
├── services/             # API calls & business logic
├── types/                # Domain types
└── index.ts             # Barrel export
```

**Ví dụ: features/catalog/**
```typescript
// services/
export async function getProducts(pageSize = 200) {
  return adminApi.get('/products', { params: { pageSize } });
}

// types/
export type Product = {
  id: string;
  name: string;
  price: number;
};

// index.ts
export * from './admin';
export * from './site';
export * from './services/admin-catalog.service';
export type { Product } from './types/catalog.types';
```

### 3. **shared/** - Reusable Components & Hooks

**Nội dung:**
- UI primitives (Button, Input, Modal, Badge, Card, Tabs)
- Generic components (StatusPopup, Breadcrumb, LanguageSwitcher)
- Custom hooks (useAsyncData, useScrollThreshold, usePagination)
- Common types (CommonQuery, CommonResponse)

**Đặc điểm:**
- ✅ Không phụ thuộc vào feature nào
- ✅ Dùng được ở nhiều feature khác nhau
- ✅ Import từ `@/shared`

```typescript
import { Button, Input, Modal } from '@/shared/ui';
import { useAsyncData, usePagination } from '@/shared/hooks';
import type { CommonQuery } from '@/shared/types';
```

### 4. **layout/** - App Shells

**Nội dung:**
- `site/` - Header, Footer, SiteLayout (dành cho site khách hàng)
- `admin/` - AdminSidebar, AdminHeader, AdminLayout (dành cho admin portal)

**Đặc điểm:**
- ✅ Wrapper layout cho app routes
- ❌ KHÔNG phải là component tái sử dụng (được dùng một lần cho cả page)
- ✅ Import từ `@/layout`

### 5. **app/** - Routes & Bootstrap

**Trách nhiệm:**
- Next.js routes (app directory)
- Page components
- API Route Handlers (BFF)
- Root layout, providers, metadata

**Đặc điểm:**
- ✅ Gọi feature services
- ✅ Gọi core layer (API, auth, config)
- ✅ Sử dụng shared components
- ✅ Sử dụng layout shells

## Dependency Flow (Chiều Mũi Tên)

```
┌─────────────────────────┐
│     app/ (routes)       │  ← Routes & API handlers
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│   features/<domain>/    │  ← Business logic & domain components
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│  shared/ & layout/      │  ← Reusable UI & app shell
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│   core/ (platform)      │  ← Infrastructure (API, auth, config, utils)
└─────────────────────────┘
```

**Quy tắc:**
- ✅ `app/ → features/ → shared/ → core/`
- ✅ `features/ → core/`
- ✅ `shared/ ↔ shared/` (cross-reference OK)
- ❌ `core/ → features/` (KHÔNG ĐƯỢC)
- ❌ `core/ → app/` (KHÔNG ĐƯỢC)

## Import Patterns

### Từ Core
```typescript
// API
import { api, adminApi, ApiError } from '@/core/api';

// Auth (server-only)
import { getCustomerSession, fetchBackendAsCustomer } from '@/core/auth';

// Config
import { getSiteUrl, getRemoteImageHosts } from '@/core/config';

// Security
import { sanitizeHtml, validateEmail } from '@/core/security';

// Utils
import { cn, formatCurrency, slugify } from '@/core/utils';
```

### Từ Feature Domain
```typescript
import { 
  getProducts, 
  updateProduct, 
  type Product 
} from '@/features/catalog';

import { 
  getOrders,
  type Order 
} from '@/features/orders';
```

### Từ Shared
```typescript
import { Button, Input, Modal } from '@/shared/ui';
import { useAsyncData, usePagination } from '@/shared/hooks';
import type { CommonQuery } from '@/shared/types';
```

### Từ Layout
```typescript
import { SiteLayout } from '@/layout/site';
import { AdminLayout } from '@/layout/admin';
```

## Best Practices

### ✅ DO

1. **Tách logic ra service:**
   ```typescript
   // features/catalog/services/admin-catalog.service.ts
   export async function getProducts() {
     return adminApi.get('/products');
   }
   ```

2. **Export từ barrel file:**
   ```typescript
   // features/catalog/index.ts
   export * from './services/admin-catalog.service';
   export * from './admin';
   export type { Product } from './types/catalog.types';
   ```

3. **Dùng core utilities:**
   ```typescript
   import { formatCurrency, cn } from '@/core/utils';
   ```

4. **Type exports từ domain:**
   ```typescript
   import type { Product } from '@/features/catalog';
   ```

### ❌ DON'T

1. **KHÔNG import business logic vào core:**
   ```typescript
   // ❌ BAD
   // src/core/api/http-client.ts
   import { getProducts } from '@/features/catalog';
   ```

2. **KHÔNG lộn xộn imports từ deep paths:**
   ```typescript
   // ❌ BAD
   import { ProductEditor } from '@/features/catalog/admin/ProductEditor';
   
   // ✅ GOOD
   import { ProductEditor } from '@/features/catalog';
   ```

3. **KHÔNG đặt business logic ở layer sai:**
   ```typescript
   // ❌ BAD: Business logic trong shared
   // src/shared/hooks/useProductFetch.ts
   
   // ✅ GOOD: Business logic trong feature
   // src/features/catalog/hooks/useProductFetch.ts
   ```

4. **KHÔNG tạo dependency cycle:**
   ```typescript
   // ❌ BAD: features/A → shared → features/B
   ```

## Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Next.js 14+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## Environment Variables

```env
# Public (visible to browser)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_URL=https://www.example.com

# Server-only
BACKEND_API_URL=https://backend.example.com
NODE_ENV=production
```

## Troubleshooting

### Import Error: "Cannot find module '@/core/...'"
→ Kiểm tra `tsconfig.json` có `"@/*": ["./src/*"]`

### Feature không thấy API response
→ Kiểm tra `NEXT_PUBLIC_API_URL` environment variable

### Admin auth không work
→ Kiểm tra `src/lib/auth/admin-session-cookie.ts` cookie config

## Tài Liệu Khác

- [Architecture Details](./ARCHITECTURE.md) - Chi tiết kiến trúc
- [Feature Development Guide](./docs/FEATURE_DEVELOPMENT.md)
- [API Integration Guide](./docs/API_INTEGRATION.md)

## Đóng Góp

Khi thêm feature mới:
1. Tạo folder mới trong `src/features/<domain>/`
2. Theo cấu trúc: `admin/`, `site/`, `services/`, `types/`
3. Export từ barrel file `index.ts`
4. Cập nhật documentation nếu cần

## License

MIT
