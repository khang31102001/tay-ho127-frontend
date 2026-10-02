# SEO Management + Schema.org — Phase 0: Architecture Audit

**Trạng thái:** CHƯA CODE. Tài liệu này + phần cập nhật đề xuất trong [database_tayho.dbml](database_tayho.dbml) là toàn bộ output của Phase 0. Chờ review/xác nhận trước khi sang Phase 1 (Database migration) và Phase 2 (Backend/Admin/Storefront implementation).

---

## 1. Current SEO State

Hệ thống **đã có một nền tảng SEO tối giản nhưng đúng kiến trúc**, không phải con số 0 như mô tả trong CONTEXT. Cụ thể:

### 1.1 Đã tồn tại — `src/lib/seo/`

| File | Vai trò | Ghi chú |
|---|---|---|
| [src/lib/seo/seo.types.ts](src/lib/seo/seo.types.ts) | `SeoPayload` — shape trung gian domain-agnostic (`title, description, path, image?, type?, publishedTime?, modifiedTime?, noindex?`) | Đã tách biệt khỏi Product/Article cụ thể — đúng nguyên tắc "SEO là cross-cutting module" (Task 35) |
| [src/lib/seo/build-metadata.ts](src/lib/seo/build-metadata.ts) | `buildMetadata(payload): Metadata` — dựng đầy đủ `title` (tự nối site name), `description`, `alternates.canonical`, `robots` (index/follow **gộp chung 1 flag `noindex`**), `openGraph` (type website/article, images, publishedTime/modifiedTime), `twitter` (card tự chọn summary/summary_large_image) | Điểm hợp nhất duy nhất — mọi page gọi qua đây, không tự viết `metadata` object rời rạc |
| [src/lib/seo/resolve-seo-payload.ts](src/lib/seo/resolve-seo-payload.ts) | `resolveSeoPayload({ endpoint, mockResolver })` — seam Mock↔Real: nếu `NEXT_PUBLIC_API_URL` được set thì gọi `api.get(endpoint)`, ngược lại chạy `mockResolver()` | **Đây là pattern quan trọng nhất cần giữ nguyên** — cùng seam với `src/lib/http/api-client.ts` (`BASE_URL = NEXT_PUBLIC_API_URL ?? ""`) đã dùng cho toàn bộ hệ thống |
| [src/lib/site-url.ts](src/lib/site-url.ts) | `getSiteUrl()` — base URL tuyệt đối từ `NEXT_PUBLIC_SITE_URL` hoặc fallback `site.following.web` | Dùng cho canonical, OG url, sitemap, robots |

### 1.2 Đã tồn tại — consumers trong `app/(site)/`

| Page | Cách dùng SEO hiện tại |
|---|---|
| `app/layout.tsx` | `metadata` tĩnh: `metadataBase`, title/description mặc định lấy từ `site.ts`, favicon |
| `app/(site)/page.tsx` (Home) | `metadata = buildMetadata({ title: site.name, description: site.tagline, path: "/" })` — tĩnh |
| `app/(site)/thuc-don/page.tsx`, `app/(site)/tin-tuc/page.tsx`, `app/(site)/bai-viet/page.tsx` | `metadata = buildMetadata({...})` tĩnh (nội dung list không đổi theo params) |
| `app/(site)/thuc-don/[slug]/page.tsx` (Product detail) | `generateMetadata()` → `resolveSeoPayload({ endpoint: "/products/{slug}/seo", mockResolver: lấy Product qua `getProductDetail()`, map `title=product.name, description=product.description ?? fallback string, image=product.image` })` → `buildMetadata()`. Có xử lý not-found (`noindex: true`) |
| `app/(site)/bai-viet/[slug]/page.tsx`, `app/(site)/tin-tuc/[slug]/page.tsx` (Article detail) | Tương tự — map `title=article.title, description=article.summary, image=` media qua `featuredMediaId`, `type: "article"`, `publishedTime`, và `noindex: article.status !== "published"` |
| `app/sitemap.ts` | `MetadataRoute.Sitemap` động — lấy Product từ `fetchMenu()`, Article từ `listPublishedArticles()`, `dynamic = "force-dynamic"` (không cache tĩnh vì data từ mock/localStorage) |
| `app/robots.ts` | `MetadataRoute.Robots` tĩnh — `disallow: ["/admin", "/checkout"]` |

### 1.3 Kết luận Task 1 (KEEP / EXTEND / CHANGE / CREATE)

| Hạng mục | Quyết định | Lý do |
|---|---|---|
| `SeoPayload`, `buildMetadata()`, `resolveSeoPayload()`, `getSiteUrl()` | **KEEP + EXTEND** | Kiến trúc đúng hướng, seam Mock↔Real đã có sẵn. Chỉ cần mở rộng field (OG/Twitter riêng title/description, robots tách index/follow, hỗ trợ JSON-LD) |
| Cách mỗi dynamic page tự map field sang `SeoPayload` trong `mockResolver` | **CHANGE** | Đây chính là chỗ "SEO Override → Entity Default → Global Default" cần được thay bằng gọi `resolveSEO(entityType, entityId, entityDefaults)` từ SEO Service thật (Task 31), thay vì mỗi page tự viết lại logic fallback (hiện tại **chưa có override layer nào** — chỉ có Entity Default → hard-code string, chưa có bảng SEO nào để Admin ghi đè) |
| `app/sitemap.ts`, `app/robots.ts` | **EXTEND** | Sitemap cần thêm Category + (nếu có route) Content Page; disallow list trong robots cần đọc từ `seo_settings` thay vì hard-code, và cần rà soát lại đúng route thực tế (xem mục 8) |
| JSON-LD / Schema.org | **CREATE hoàn toàn** | Không có bất kỳ dòng nào implement `<script type="application/ld+json">`, không có component `JsonLd`/`StructuredData`, không có khái niệm Schema Type trong toàn bộ `src/` và `app/` (đã grep xác nhận) |
| Bảng SEO Metadata/Settings/Schema/Redirect trong DB | **CREATE hoàn toàn** | Chưa có bảng nào — `site.ts`/`brand_settings` chỉ đóng vai trò site info chung, không phải SEO override per-entity |
| Admin SEO module | **CREATE hoàn toàn** | Không có route `app/admin/**/seo/**`, không có `src/features/seo/` |
| `Product.description`, `Article.summary`, `Media.altText`, `Media.url` | **KEEP, reuse làm Entity Default fallback** | Đây chính là "Product Short Description"/"Product Main Image" trong Task 4 — đã tồn tại sẵn, không cần thêm field trùng lặp trên Product/Article |

---

## 2. Missing Components

1. **Không có persistence cho SEO override** — mọi field SEO hiện tại (title/description/image) là **derive trực tiếp** từ Product/Article, Admin **không có cách nào** nhập `meta_title` riêng khác với `Product.name`.
2. **Không có Global SEO Settings** — `site.name`/`site.tagline`/`site.following.web` trong `src/data/site.ts` đóng vai trò fallback ngầm định nhưng không phải một "SEO Settings" có thể chỉnh trong Admin, và **bản thân các field này đã trùng lặp với `brand_settings`** (xem mục 8.1 — rủi ro quan trọng nhất của toàn bộ thiết kế).
3. **Không có Schema.org/JSON-LD** ở bất kỳ page nào — 0% coverage.
4. **Không có Redirect Management** — đổi slug Product/Category/Article hôm nay = mất SEO ngay lập tức (404 không có 301), vì `slug` chỉ là 1 field phẳng trên entity, không có lịch sử redirect.
5. **`robots.ts` disallow list chưa đầy đủ theo routing thực tế** — chỉ có `/admin`, `/checkout`, trong khi routing thực tế còn có `/gio-hang` (cart), `/tai-khoan/don-hang` (account orders), `/don-hang/[orderCode]` (order tracking — chứa thông tin đơn hàng cá nhân), `/payment/[sessionId]` — đều là luồng giao dịch cá nhân hoá, nên cân nhắc disallow tương tự `/checkout` (xem mục 8.3, cần xác nhận business rule trước khi tự thêm theo đúng rule Task 27 "phải kiểm tra routing thực tế trước khi cấu hình").
6. **Category không có public detail page** — routing hiện tại là `/thuc-don` (trang thực đơn tổng, không phải theo từng category riêng) và `/thuc-don/[slug]` (product detail). Không có route dạng `/thuc-don/danh-muc/[slug]`. Nghĩa là "Category SEO" (Task 21) hôm nay **không có URL riêng để gắn canonical/OG** — cần xác nhận: có route Category riêng trong roadmap không, hay Category SEO chỉ dùng cho breadcrumb/schema lồng trong Product page?
7. **Content Page (CMS `pages`/`page_sections`) không có route public nào** — `app/(site)/**` không có `/trang/[slug]` hay tương đương render `ManagedPage`+`ManagedPageSection`. Toàn bộ CMS Page hiện tại chỉ tồn tại ở Admin (`app/admin/(dashboard)/content/pages/**`). Task 22 ("Content Page hỗ trợ SEO...") vì vậy là **thiết kế đón đầu (forward-looking)** — schema/API nên hỗ trợ `entity_type = 'page'` nhưng **chưa có gì để tích hợp ở Storefront cho tới khi route này tồn tại**.
8. **Không có Breadcrumb component dùng chung** — chỉ có 1 link "quay lại" đơn giản trong `ProductDetail.tsx` (không phải breadcrumb nhiều cấp), cần xây mới cho `BreadcrumbList` schema.
9. **Không có validation library cho JSON tùy chỉnh** — chưa có `zod`/`ajv` trong `package.json`; JSON-LD validation hôm nay chỉ có thể dùng `JSON.parse` try/catch thuần (đủ cho Task 15, không cần thêm dependency).

---

## 3. Proposed Architecture

```
Admin (features/seo, features/seo-schema)
    ↓ CRUD qua service (mock hôm nay, seam giống mọi feature khác)
seo_metadata / seo_schema / seo_settings / redirect  (Database — Phase 1)
    ↓
Backend API (/api/seo/**)  — Phase 2, theo đúng pattern api-client.ts hiện có
    ↓
SEO Domain (src/features/seo) — Service Layer
    ├── resolveSEO(entityType, entityId, entityDefaults) → SeoPayload mở rộng
    └── resolveSchema(entityType, entityId, entityData)  → JSON-LD object[]
    ↓
Storefront (app/(site)/**)
    ├── generateMetadata() → buildMetadata() (đã có, EXTEND)
    └── <JsonLd data={schema} /> (component mới, Task 19)
```

### 3.1 Nguyên tắc giữ nguyên từ audit

- **KHÔNG** để Product/Article/Category tự chứa field SEO (`meta_title`, `og_image`...) — đúng Task 35, và đúng luôn với thiết kế `SeoPayload` tách biệt đã có sẵn.
- **KHÔNG** tạo API/service pattern mới — `seo_metadata`/`seo_schema`/`seo_settings`/`redirect` đi theo đúng pattern `mocks/<name>.mock.ts` + `services/<name>.service.ts` (localStorage hôm nay) → khi Backend ASP.NET Core sẵn sàng chỉ set `NEXT_PUBLIC_API_URL`, không sửa gì ở Storefront — **giống hệt cách `resolveSeoPayload` đã làm hôm nay**, chỉ là nay có bảng thật đứng sau mock thay vì literal string map trong từng page.
- **KHÔNG** đặt HTTP transport logic (`fetch`/`api.get`) trong page component — mọi resolve đi qua `src/features/seo/services/*.service.ts`.
- Cấu trúc feature mới tuân thủ đúng barrel pattern hiện tại: `src/features/seo/{types,mocks,services,components,hooks}/index.ts`.

### 3.2 SEO Resolver — `resolveSEO()`

```
entity (Product | Article | Category | Page | Homepage)
    ↓ có seo_metadata override cho (entity_type, entity_id) không?
  CÓ → dùng field override (chỉ field nào Admin đã nhập, field trống vẫn fallback tiếp)
    ↓ (field còn thiếu)
  Entity Default (Product.name/description/image, Article.title/summary/featuredMedia...)
    ↓ (field còn thiếu)
  seo_settings (default_title_template, default_description, default_og_image...)
    ↓
  SeoPayload đầy đủ → buildMetadata()
```

Đây **chính là logic Task 4 yêu cầu**, KHÔNG mới — chỉ khác là hôm nay bước 1 (SEO Override) chưa tồn tại vì chưa có bảng `seo_metadata`.

### 3.3 Schema Resolver — `resolveSchema()`

```
entity data (Product.name/price/description/image...)
    +
seo_schema config (entity_type, entity_id, schema_type, is_active)
    +
seo_schema.custom_json_ld (nếu Admin dùng Advanced Mode override toàn bộ)
    ↓
Schema Generator (1 pure function/schema_type — KHÔNG gọi HTTP, nhận entity data làm input)
    ↓
JSON-LD object → <JsonLd data={...} />
```

Global Schema (Organization/Restaurant/WebSite) render 1 lần ở `app/(site)/layout.tsx`; Page Schema (Product/BreadcrumbList/Article/FAQPage) render tại chính page tương ứng — **không trùng lặp Organization/WebSite ở từng page con** (Task 9).

---

## 4. Database Changes

Đã cập nhật **[database_tayho.dbml](database_tayho.dbml)** (đã validate bằng `pydbml`, xem mục cuối). Tóm tắt phần thêm mới — **CHƯA migrate**, chỉ là đề xuất:

| Bảng mới | Mục đích | Quan hệ |
|---|---|---|
| `seo_metadata` | Override SEO per-entity (Task 3) | Polymorphic `(entity_type, entity_id)` — không FK cứng (giống pattern `navigation_items.target_id` đã có trong file); `og_image_media_id`/`twitter_image_media_id` → FK thật tới `media.id` |
| `seo_settings` | Global SEO fallback (Task 5) | **Đã THU GỌN so với spec gốc** — xem cảnh báo quan trọng ở mục 8.1 |
| `seo_schema` | Schema.org config per-entity + Global (Task 6-10) | Polymorphic tương tự `seo_metadata`, `is_global` phân biệt Organization/WebSite (không entity) với Product/BreadcrumbList (có entity) |
| `redirect` | 301/302 khi đổi slug (Task 25) | Không FK tới entity nào — `source_path`/`destination_url` là string độc lập, đúng bản chất redirect (URL cũ có thể không còn entity nào đứng sau) |

**Không tạo thêm bảng nào ngoài 4 bảng trên** — đã cân nhắc theo Task 29 ("kiểm tra có thể giảm số bảng hay không"): ban đầu Task 5 liệt kê `seo_settings` có `organization_name/organization_logo/business_name/phone/email/address/social URLs` — toàn bộ nhóm field này **trùng lặp với `brand_settings`** đã thiết kế ở phase trước. Đã loại bỏ khỏi `seo_settings`, xem chi tiết + lý do ở mục 8.1.

---

## 5. Backend Changes

*(Thiết kế cho Phase 2 — chưa code trong Phase 0)*

Theo đúng pattern hiện có (`src/lib/http/api-client.ts` + `resolveSeoPayload`), **không tạo kiến trúc API song song**:

```
GET    /api/seo/{entityType}/{entityId}      → SeoMetadataDto | null (null = chưa có override)
PUT    /api/seo/{entityType}/{entityId}      → upsert override
DELETE /api/seo/{entityType}/{entityId}      → reset override (xoá hàng, không xoá entity)

GET    /api/seo/settings                     → SeoSettingsDto (singleton, luôn tồn tại)
PUT    /api/seo/settings

GET    /api/seo/schema/{entityType}/{entityId}   → SeoSchemaDto[] (nhiều schema/entity)
PUT    /api/seo/schema/{entityType}/{entityId}/{schemaType}
DELETE /api/seo/schema/{entityType}/{entityId}/{schemaType}

GET    /api/seo/redirects
POST   /api/seo/redirects
PUT    /api/seo/redirects/{id}
DELETE /api/seo/redirects/{id}
```

Không thêm API `/api/seo/preview` hay `/api/seo/validate` riêng — Google/Social Preview (Task 14) và Validation (Task 15) đều là pure function chạy **client-side trong Admin** trên data đã có sẵn (không cần round-trip server).

**Aggregate response** (Task 34 — performance): Product/Article detail API (khi Backend ASP.NET Core thật) nên trả kèm `seo` object lồng trong response Product/Article thay vì Storefront phải gọi 2 request riêng — điều này **khớp với chính comment đã có sẵn trong code**: `resolveSeoPayload`'s TEMPORARY CONTRACT ghi rõ endpoint đề xuất là `/products/{slug}/seo` (request riêng). Đây là một quyết định kiến trúc cần xác nhận: giữ endpoint riêng (đơn giản hơn, đã có sẵn pattern) hay gộp vào response Product (đúng Task 34 hơn nhưng đổi API contract đã note trong code). **Đề xuất: giữ endpoint SEO riêng cho Phase 2 (không phá vỡ pattern đã note sẵn trong code), tối ưu aggregate là Phase sau nếu đo được vấn đề hiệu năng thật** — tránh over-engineering sớm.

---

## 6. Admin Changes

*(Thiết kế cho Phase 3 — chưa code trong Phase 0)*

- `src/features/seo/` — theo đúng shape chuẩn feature CRUD hiện có: `types/`, `mocks/`, `services/`, `components/` (`SeoDashboard`, `SeoMetadataExplorer`, `SeoEditor` — dùng lại `DataExplorer`/`DataEditor` template đã có ở `src/components/admin/templates/`), `hooks/`.
- `SeoEditor` là **1 component dùng chung**, không phải màn riêng cho từng loại entity — được nhúng vào:
  - `app/admin/(dashboard)/catalog/products/[id]/page.tsx` — thêm tab "SEO"
  - `app/admin/(dashboard)/catalog/categories/[id]/page.tsx` — thêm tab "SEO"
  - `app/admin/(dashboard)/content/articles/[id]/page.tsx`, `content/pages/[id]/page.tsx` — thêm tab "SEO"
  - Route riêng `app/admin/(dashboard)/settings/seo/page.tsx` (Global Settings) và `app/admin/(dashboard)/settings/redirects/**` (Redirect management)
- Reuse `StatusPopup`, `formFieldClassName`, `DataEditor` Save/Delete chrome — **không tạo UI primitive mới** nếu Tailwind + component nội bộ hiện có đã đáp ứng (đúng `.claude/rules/frontend-ui.md.txt`).
- Google/Social Preview (Task 14) là 1 **component thuần hiển thị** (`GoogleSearchPreview`, `SocialPreview`) nhận props `{ title, description, url, image }` — không gọi API.

---

## 7. Storefront Changes

*(Thiết kế cho Phase 5-6 — chưa code trong Phase 0)*

- `src/lib/seo/seo.types.ts` — **EXTEND** `SeoPayload`: thêm `ogTitle?`, `ogDescription?`, `twitterTitle?`, `twitterDescription?`, tách `robotsIndex?`/`robotsFollow?` thay vì 1 boolean `noindex` gộp chung (khớp đúng Task 3's `robots_index`/`robots_follow` tách biệt).
- `src/lib/seo/build-metadata.ts` — **EXTEND** để dùng field mới, KHÔNG đổi signature `buildMetadata(payload): Metadata` (backward compatible — Task constraint "không tự ý thay đổi API contract hiện tại").
- Mỗi `generateMetadata()` ở dynamic page — **CHANGE** phần `mockResolver` để gọi `resolveSEO()` từ `src/features/seo` thay vì tự map field thủ công như hiện tại — logic fallback chuyển hẳn vào Service Layer (Task 31), page chỉ còn gọi 1 hàm.
- Component mới `src/components/shared/JsonLd.tsx` — `<JsonLd data={schema} />`, render `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />` (an toàn vì `JSON.stringify` tự escape, không phải `dangerouslySetInnerHTML` với HTML thô — xem Task 33).
- `app/(site)/layout.tsx` — thêm Global Schema (Organization/Restaurant/WebSite) 1 lần duy nhất.
- `app/sitemap.ts` — **EXTEND** thêm Category (nếu có route riêng, xem câu hỏi mở ở mục 2.6) và tôn trọng `seo_metadata.robots_index = false` (không đưa page bị noindex vào sitemap).
- `app/robots.ts` — **EXTEND** đọc `disallow` list từ `seo_settings` thay vì hard-code, sau khi rà soát lại đúng danh sách route cá nhân hoá (mục 8.3).

---

## 8. Risks / Breaking Changes

### 8.1 ⚠️ QUAN TRỌNG — `seo_settings` (Task 5) trùng lặp dữ liệu với `brand_settings`

Task 5 yêu cầu `seo_settings` có `organization_name`, `organization_logo`, `business_name`, `phone`, `email`, `address`, `social URLs`. Toàn bộ nhóm field này **đã tồn tại 1:1 trên `brand_settings`** (`name`, `logoMediaId`, `phone`, `email`, `addressLine/ward/district/province`, `socialLinks[]` — thiết kế ở phase Database trước). Tạo lại trong `seo_settings` sẽ vi phạm trực tiếp Task 8 ("Không duplicate dữ liệu nếu có thể lấy từ Product") áp dụng tương tự cho Brand, và Task 29 ("kiểm tra có thể giảm số bảng... Không over-engineering").

**Đề xuất (đã áp dụng trong DBML):** `seo_settings` chỉ giữ field **thực sự SEO-specific, không tồn tại ở đâu khác**: `default_title_template`, `default_description`, `default_og_image_media_id`, `twitter_site`, `twitter_creator`, `default_robots_index`, `default_robots_follow`. `Organization`/`LocalBusiness`/`Restaurant` schema generator (Task 6) đọc trực tiếp từ `brand_settings` + `social_links` khi build JSON-LD, KHÔNG đọc từ `seo_settings`. `site_name`/`site_url` tiếp tục lấy từ `brand_settings.name` + `getSiteUrl()` (đã có sẵn), không thêm cột trùng.

→ **Đây là điểm cần bạn xác nhận rõ ràng trước khi sang Phase 1** — nếu có lý do business để 2 bảng độc lập (vd. tên hiển thị SEO khác tên thương hiệu chính thức), báo lại để khôi phục các field đó.

### 8.2 Product hiện tại xuất hiện ở 2 URL cho Article (`/bai-viet/[slug]` và `/tin-tuc/[slug]`)

`app/sitemap.ts` (comment dòng 36-37) tự xác nhận: "Bài viết hiện có mặt ở cả /bai-viet và /tin-tuc (2 route song song)... cả 2 đều là URL thật, đưa cả 2 vào sitemap." Đây là **duplicate content thật sự** (cùng 1 `ManagedArticle` render ở 2 URL) — vi phạm trực tiếp Task 28 ("Không để... tạo duplicate canonical"). Với `seo_metadata` khoá theo `(entity_type='article', entity_id)`, canonical sẽ chỉ trỏ về **1 URL** — cần bạn quyết định URL nào là canonical chính thức (`/bai-viet` hay `/tin-tuc`) trước khi build `resolveSEO()`, vì hiện tại cả 2 page tự gọi `resolveSeoPayload` độc lập với `path` khác nhau → sẽ tự sinh 2 canonical khác nhau trỏ vào chính nó, không giải quyết được vấn đề chỉ bằng thêm bảng.

**Dừng lại, cần bạn xác nhận:** giữ cả 2 route (1 route dùng `<link rel="canonical">` trỏ sang route kia), hay gộp về 1 route + redirect route còn lại?

### 8.3 `robots.ts` disallow list chưa đủ theo routing thực tế

Route hiện tại có thêm `/gio-hang`, `/tai-khoan/don-hang`, `/don-hang/[orderCode]`, `/payment/[sessionId]` — đều là luồng cá nhân/giao dịch, tương tự lý do `/checkout` bị disallow. Task 27 yêu cầu "phải kiểm tra routing thực tế trước khi cấu hình" — đã kiểm tra xong (liệt kê ở trên), nhưng **quyết định disallow route nào vẫn cần bạn xác nhận** (không tự ý mở rộng business rule).

### 8.4 Content Page (Task 22) chưa có route Storefront

Như nêu ở mục 2.7 — schema/API sẽ hỗ trợ `entity_type='page'` nhưng sẽ **không có gì để test/verify ở Storefront** cho tới khi route `/trang/[slug]` (hoặc tên tương đương) được tạo. Không nằm trong phạm vi SEO module để tự tạo route này — cần xác nhận có thuộc Phase 4 SEO hay là một task Content riêng.

### 8.5 Category không có canonical URL riêng

Mục 2.6 — cần xác nhận Category SEO (Task 21) áp dụng cho URL nào, nếu chưa có route Category riêng.

### 8.6 Breaking changes

**Không có breaking change nào nếu làm đúng kế hoạch trên** — `buildMetadata()` giữ nguyên signature, mọi field mới trong `SeoPayload` đều optional, `seo_settings`/`seo_metadata` là bảng mới hoàn toàn không đụng tới bảng hiện có (chỉ thêm FK mới trỏ tới `media.id`, không sửa `media` table).

---

## 9. Implementation Plan (nhắc lại theo Phase đã yêu cầu — chưa thực hiện)

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 0 | Audit (tài liệu này) | ✅ Hoàn thành — chờ review |
| 1 | Database Design (DBML) | ✅ Đã cập nhật `database_tayho.dbml` — chờ review, CHƯA migrate |
| 2 | SEO Domain/Backend (`src/features/seo`, API) | ⏸ Chờ Phase 0+1 được duyệt |
| 3 | Admin SEO (Dashboard/List/Editor/Preview) | ⏸ |
| 4 | Entity Integration (tab SEO trong Product/Category/Page editor) | ⏸ |
| 5 | Storefront Metadata (`generateMetadata`/canonical/OG/Twitter/robots) | ⏸ |
| 6 | Structured Data (Organization/Restaurant/WebSite/Product/Offer/Breadcrumb/FAQ) | ⏸ |
| 7 | Technical SEO (Sitemap/Robots/Redirect) | ⏸ |
| 8 | QA | ⏸ |

**Câu hỏi cần bạn trả lời trước khi mở Phase 1:**
1. Đồng ý thu gọn `seo_settings` (bỏ field trùng `brand_settings`) như mục 8.1 không?
2. `/bai-viet` vs `/tin-tuc` — route nào là canonical chính thức? (mục 8.2)
3. Route nào trong `/gio-hang`, `/tai-khoan/don-hang`, `/don-hang/[orderCode]`, `/payment/[sessionId]` cần thêm vào `robots disallow`? (mục 8.3)
4. Content Page public route (`/trang/[slug]`...) có thuộc phạm vi SEO module hay là task riêng? (mục 8.4)
5. Category có cần route/URL riêng trong roadmap gần không, hay SEO Category chỉ phục vụ breadcrumb/schema lồng trong Product? (mục 8.5)

---

## Phụ lục — Validate DBML

Đã chạy `pydbml` sau khi thêm 4 bảng SEO mới vào `database_tayho.dbml`:

```
PARSED OK
tables: 43   (39 cũ + 4 mới: seo_metadata, seo_settings, seo_schema, redirect)
refs: 50     (47 cũ + 3 mới: seo_metadata→media ×2, seo_settings→media — seo_schema/redirect không FK entity vì polymorphic/không gắn entity)
enums: 24    (21 cũ + 3 mới: seo_entity_type, seo_schema_type, redirect_type)
table_groups: 8  (7 cũ + "SEO")
```

Đã kiểm tra thêm: composite unique index `(entity_type, entity_id)` trên `seo_metadata` và `(entity_type, entity_id, schema_type)` trên `seo_schema` xuất SQL đúng (`CREATE UNIQUE INDEX`) khi export thử qua `pydbml`.
