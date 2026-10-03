# Proposal: module SEO (nhóm SEO) — BE + tích hợp FE

Trạng thái: **đang triển khai** — bước 1 (SEO Settings + robots.txt) , bước 2 (SEO Metadata), bước 3 (Redirects) và bước 4 (Schema) đã làm xong ở nhánh `feat/seo-settings` (BE + FE) — cả 4 bước hoàn tất. Quyết định đã áp dụng ở bước 2: khóa override theo Id (Guid), API công khai trả danh sách noindex riêng.

## 1. Kết luận kiểm tra: module SEO đã đầy đủ chưa?

**Chưa.** Chỉ có Frontend (Admin UI + logic resolve) và thiết kế bảng trong file SQL. Backend chưa có gì, nên toàn bộ SEO đang chạy trên mock.

| Tầng | Trạng thái | Chi tiết (đã kiểm tra trong code) |
|---|---|---|
| **Database** (`backend/database_tayho (1).sql`) | Có thiết kế, **chưa có migration thật** | 4 bảng `seo_metadata`, `seo_settings`, `seo_schema`, `redirect` + 3 enum `seo_entity_type` (product/category/article/page/homepage), `seo_schema_type`, `redirect_type` (301/302). Unique `(entity_type, entity_id)` và `(entity_type, entity_id, schema_type)`; `redirect.source_path` unique; FK `seo_metadata.og_image_media_id → media`. |
| **Backend** (`backend/src/Modules`) | **Không có** | 9 module (AccessControl, Catalog, Content, Customer, Identity, Media, Navigation, Organization, Platform), không module SEO. Không có entity, controller, permission `seo.*`/`redirects.*`. Chỉ `NavigationSeeder.cs` seed 4 mục sidebar (Tổng quan, SEO Metadata, Cài đặt SEO, Redirects) với `permission = null` (mọi admin đều thấy). |
| **Frontend – Admin** | Có đủ UI, **dữ liệu mock** | `features/seo` (Dashboard, Metadata Explorer/Editor, Settings, Schema, preview Google/Social) và `features/redirects` (Explorer/Editor). 4 service (`seo-metadata`, `seo-settings`, `seo-schema`, `redirect`) đều đọc/ghi `localStorage` (`tayho-admin-seo-*`, `tayho-admin-redirects`) kèm delay giả. |
| **Frontend – Site** | Có logic dùng SEO, nhưng **đọc dữ liệu seed** | `resolveSeoPayloadForEntity` (fallback Override → Entity default → SEO Settings), `buildMetadata`, JSON-LD (`seo-schema-resolver`), `robots.ts`, `sitemap.ts`, `middleware.ts` (redirect). |

### Lỗi thật đang tồn tại do mock (quan trọng)

1. **Admin sửa SEO không bao giờ lên Site.** Khi chạy trên server (generateMetadata, `robots.ts`, `sitemap.ts`), các service trả `SEED_*` cố định vì `window` không tồn tại. Admin chỉnh title/robots/noindex/disallow xong, Site thật vẫn dùng dữ liệu seed.
2. **Redirect không hoạt động đúng.** `middleware.ts` gọi `findActiveRedirect()` đọc seed — redirect Admin tạo mới không có hiệu lực (chính comment trong middleware đã ghi hạn chế này).
3. **Khóa entity không ổn định.** Product khóa theo `params.slug` (`thuc-don/[slug]/page.tsx`), Article khóa theo `article.id` (GUID Backend). Đổi slug sản phẩm thì override SEO mất; `seed` mock dùng id cũ (`product-bc001`, `cong-thuc-...`) không còn khớp dữ liệu Backend.
4. **`resolveSeoPayload` có nhánh chết gây 500 tiềm ẩn:** nếu set `NEXT_PUBLIC_API_URL` thì gọi `GET /news/{slug}/seo`, `/articles/{slug}/seo` — Backend không có endpoint này, `generateMetadata` ném lỗi. (Liên quan lỗi 500 trang chi tiết tin tức đang điều tra; xem câu hỏi 9.)
5. **Directory SEO trộn nguồn:** `seo-entity-directory.ts` lấy Product/Category/Article từ service Admin (Backend), trong khi override lưu mock. Category và Page chưa có route công khai nên sitemap/metadata không áp dụng được.
6. **Schema override chỉ nối cho Product.** `resolveArticlePageSchemas` chưa đọc `seo_schema` (đã ghi chú trong code). Organization/Restaurant/WebSite luôn derive từ `brand_settings`.

## 2. Phạm vi đề xuất

**Làm:** 1 module Backend **`Seo`** (3 thực thể SEO + Redirect), nối Admin FE (4 mục sidebar) và Site (metadata, robots, sitemap, JSON-LD, redirect).

**Không làm (đợt này):** tự tạo redirect khi đổi slug (SQL comment đã nói rõ chưa có business rule), SEO cho Category/Page ở Site (chưa có route công khai render), analytics/crawler/báo cáo Search Console, A/B hay đa ngôn ngữ (hreflang).

## 3. Thiết kế Backend

Theo đúng kiến trúc hiện tại (`Domain / Application / Infrastructure / Api`, schema Postgres `seo`, `ISeoDbContext`, `AuditableEntity`, không FK sang module khác, Guid id).

### Thực thể (bám theo SQL đã duyệt)
- **SeoMetadata**: `entityType`, `entityId` (chuỗi mờ, null chỉ khi `homepage`), `metaTitle`, `metaDescription`, `canonicalUrl`, `robotsIndex`, `robotsFollow`, `ogTitle`, `ogDescription`, `ogImageMediaId`, `twitterTitle`, `twitterDescription`, `twitterImageMediaId`. Unique `(entityType, entityId)`; `ogImageMediaId` là chuỗi mờ như `featuredMediaId` (không FK sang Media, vì Media là module khác).
- **SeoSettings** (singleton, id cố định `seo-settings`): `defaultTitleTemplate` (chứa `%s`), `defaultDescription`, `defaultOgImageMediaId`, `twitterSite`, `twitterCreator`, `defaultRobotsIndex`, `defaultRobotsFollow`, `robotsDisallowPaths` (**FE đã có field này nhưng SQL chưa có cột** — cần thêm, xem câu hỏi 6).
- **SeoSchema**: `entityType?`, `entityId?`, `schemaType`, `isGlobal`, `config` (JSON), `customJsonLd`, `isCustomOverride`, `isActive`. Unique `(entityType, entityId, schemaType)`; validate `customJsonLd` là JSON hợp lệ khi lưu.
- **Redirect**: `sourcePath` (unique, chuẩn hóa bắt đầu bằng `/`), `destinationUrl`, `redirectType` (301/302), `isActive`. Chặn vòng lặp A→B→A và `source == destination`.

### Endpoint
- Admin (`[RequirePermission]`): `/api/v1/seo/metadata` (list có lọc `entityType`, get/put/delete theo cặp `entityType + entityId`), `/api/v1/seo/settings` (GET/PUT singleton), `/api/v1/seo/schemas`, `/api/v1/seo/redirects` (CRUD).
- Công khai (`[AllowAnonymous]`, snapshot nhỏ, Site cache 60 giây như `catalog/public`/`content/public`):
  - `GET /api/v1/seo/public/settings` — settings + danh sách `robotsDisallowPaths`.
  - `GET /api/v1/seo/public/metadata?entityType=&entityId=` — 1 override; kèm `GET /public/noindex` (danh sách khóa entity bị noindex, cho sitemap).
  - `GET /api/v1/seo/public/schema?entityType=&entityId=` — override JSON-LD đang bật.
  - `GET /api/v1/seo/public/redirects` — toàn bộ redirect đang bật (nhẹ, vài trăm dòng), dùng cho middleware.
- Quyền mới: `seo-metadata.*`, `seo-settings.view|update`, `seo-schemas.*`, `redirects.*` (view/create/update/delete); gắn quyền view cho 4 mục sidebar (hiện đang `null`). Đăng ký trong `PermissionCatalog`.

### Migration / seed
- Migration `InitialCreate` cho `SeoDbContext`; đăng ký trong Host + Migrator.
- Seed **`SeoSettings` mặc định** (bắt buộc, vì `defaultDescription NOT NULL` và Site cần fallback) và `robotsDisallowPaths` mặc định (`/admin`, `/api`, `/gio-hang`, `/checkout`, `/payment`, `/tai-khoan`, `/don-hang`). Metadata/schema/redirect mẫu chỉ ở `seed-demo`, không bắt buộc.

## 4. Tích hợp Frontend

Theo pattern đã dùng cho Catalog/Content: viết lại `services/*.service.ts`, bỏ mock + `localStorage`, giữ nguyên component UI.

- **Admin:** 4 service (`seo-metadata`, `seo-settings`, `seo-schema`, `redirect`) gọi `adminApi`, map DTO ↔ type của feature; hook dùng `useAsyncData`. Component `SeoEditor`, `SeoFieldsForm`, preview, Explorer giữ nguyên.
- **Site (server-only):** thêm `features/seo-public` hoặc đặt trong `features/seo/services/seo-public.service.ts` (gọi `fetchBackend`, cache 60 giây, Backend lỗi → fallback an toàn: dùng entity default + settings mặc định, không làm vỡ trang). `seo-resolver.service` và `seo-schema-resolver.service` chuyển sang đọc từ đây — **chỉ đổi nguồn dữ liệu, giữ nguyên chuỗi fallback Override → Entity default → Settings**.
- **`robots.ts` / `sitemap.ts`:** đọc `robotsDisallowPaths` và danh sách noindex từ API công khai. Sitemap giữ logic hiện tại, thêm bỏ qua entity noindex theo khóa mới (câu hỏi 2).
- **Redirect:** `middleware.ts` chạy ở Edge nên không dùng localStorage. Dùng `fetch` tới Route Handler nội bộ `app/api/seo/public/redirects` (hoặc gọi thẳng Backend) kèm cache 60 giây trong bộ nhớ; lỗi/không kết nối → bỏ qua redirect, không chặn request.
- **Dọn nhánh chết:** bỏ nhánh `NEXT_PUBLIC_API_URL → api.get(endpoint)` trong `lib/seo/resolve-seo-payload.ts` (và tham số `endpoint` ở các `generateMetadata`), vì dữ liệu SEO giờ đi qua service Backend. Việc này đồng thời loại bỏ nguồn gây 500 ở mục 1.4.
- **Admin directory:** `seo-entity-directory.ts` tiếp tục lấy Product/Category/Article từ Backend; thêm `page` khi Site có route Page công khai.

## 5. Kế hoạch triển khai (mỗi bước một cặp PR BE + FE, merge tuần tự)

1. **SEO Settings + robots.txt:** singleton, seed mặc định, API công khai, `robots.ts` + `resolveSeoPayloadForEntity` đọc settings thật. Hiệu quả nhỏ, rủi ro thấp, mở đường cho các bước sau.
2. **SEO Metadata:** CRUD + public lookup, sửa khóa entity (câu hỏi 1), gỡ nhánh `NEXT_PUBLIC_API_URL`, `sitemap.ts` lọc noindex.
3. **Redirects:** CRUD + validate vòng lặp, public list, `middleware.ts` đọc Backend.
4. **SEO Schema (JSON-LD override):** CRUD + validate JSON, nối `resolveProductPageSchemas` và (mới) `resolveArticlePageSchemas`.
5. Mỗi bước: unit test + integration test (CRUD, quyền, public, validate), migration tăng dần, cập nhật quyền trong seed menu.
6. Cuối cùng: dọn mock (`mocks/seo-*.mock.ts`, `redirect.mock.ts`), cập nhật `CLAUDE.md` + `CHANGELOG.md`.

## 6. Cần bạn quyết định (mình không tự suy diễn)

1. **Khóa entity:** override SEO của Product khóa theo `slug` (hiện tại, đổi slug thì mất) hay theo **Id (Guid)** như Article (đề xuất, ổn định hơn nhưng sửa `thuc-don/[slug]/page.tsx` để tra id từ slug)?
2. **Sitemap noindex:** API công khai trả danh sách khóa noindex riêng (đề xuất) hay trả cả metadata hàng loạt?
3. **Vị trí module:** tạo module **`Seo`** riêng (đề xuất) hay đặt `Redirect` vào `Platform`/`Navigation`?
4. **Redirect chạy ở đâu:** giữ `middleware.ts` (đề xuất, Edge gọi Backend có cache) hay chuyển sang tầng reverse proxy/Nginx khi deploy?
5. **Seed:** seed `SeoSettings` + disallow mặc định trong `seed` (đề xuất, Site có SEO ngay) hay chỉ `seed-demo`?
6. **`robotsDisallowPaths`:** thêm cột `text[]`/JSON vào `seo_settings` (đề xuất; SQL chưa có cột này dù FE đang dùng).
7. **Schema override:** làm cả Article (hiện chưa nối) hay chỉ giữ Product + FAQ như hiện tại để thu hẹp phạm vi?
8. **Quyền mới:** chấp nhận tên mã ở mục 3; cấp mặc định cho role nào ngoài SuperAdmin?
9. **Lỗi 500 trang chi tiết tin tức:** nếu nguyên nhân xác nhận là `NEXT_PUBLIC_API_URL`, có muốn **sửa nóng trước** (bỏ nhánh `api.get` ở `resolveSeoPayload`, không đợi bước 2) không?
10. **Thứ tự ưu tiên** ở mục 5 có phù hợp không (đề xuất Settings → Metadata → Redirects → Schema vì Settings/Metadata ảnh hưởng trực tiếp Site)?

## 7. Rủi ro đã nhận diện

- Dữ liệu `localStorage` cũ của Admin sẽ không tự chuyển lên Backend; cần quyết định có export/import tay hay bỏ (SEO thường ít dữ liệu).
- `ogImageMediaId` có thể là id mock cũ (`media-...`) hoặc Guid Media; lưu chuỗi mờ, Site tự phân giải, ảnh không tìm thấy thì fallback mặc định.
- Middleware gọi Backend mỗi request làm tăng độ trễ nếu không cache; phải có cache + timeout ngắn + fail-open.
- Redirect sai (vòng lặp, trỏ vào route chính) có thể làm hỏng điều hướng toàn Site → validate chặt ở Backend và chặn `sourcePath` thuộc `/admin`, `/api`.
- Canonical/redirect cần `getSiteUrl()` đúng ở môi trường deploy, nếu sai sẽ sinh URL sai trong sitemap/JSON-LD.

## CHANGE REPORT

### 1. Summary
- Kiểm tra SEO ở FE, BE, DB và viết proposal; không sửa code ứng dụng.

### 2. Files Changed
- [ADDED] `docs/proposals/seo-module.md`

### 3. Logic Changes
- Không.

### 4. Refactoring / Optimization
- Không.

### 5. Behavior Impact
- UI: Không thay đổi
- Business Logic: Không thay đổi
- API Contract: Không thay đổi (chỉ đề xuất)
- Database: Không thay đổi (chỉ đề xuất)
- Breaking Change: Không

### 6. Verification
- Build: NOT RUN
- Lint: NOT RUN
- Tests: NOT RUN
- Type Check: NOT RUN

### 7. Remaining Issues
- Các câu hỏi ở mục 6 cần được quyết định trước khi code.

### 8. Recommended Next Step
- Duyệt/chỉnh proposal rồi bắt đầu bước 1 (SEO Settings + robots.txt).
