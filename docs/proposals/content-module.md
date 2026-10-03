# Proposal: module Content (nhóm CONTENT) — BE + tích hợp FE

Trạng thái: **chờ duyệt**. Chưa có dòng code nào được viết cho đề xuất này.

## 1. Hiện trạng (đã kiểm tra trong code)

Nhóm CONTENT trong sidebar có 5 mục, seed ở `NavigationSeeder.cs` (cả 5 đều `permission = null`, tức mọi admin đều thấy):

| Mục sidebar | Route Admin | Feature FE | Backend | Dữ liệu hiện tại |
|---|---|---|---|---|
| Page | `/admin/content/pages` (+ `/{id}/sections`) | `features/pages`, `features/page-sections` | **Chưa có** | mock `localStorage` (`tayho-admin-pages`, `tayho-admin-page-sections`) |
| Banner | `/admin/content/banners` | `features/banners` | **Chưa có** | mock `localStorage` |
| Bài viết | `/admin/content/articles` | `features/articles` | **Chưa có** | mock `localStorage` |
| Danh mục bài viết | `/admin/content/article-categories` | `features/article-categories` | **Chưa có** | mock `localStorage` |
| Thẻ bài viết | `/admin/content/article-tags` | `features/article-tags` | **Chưa có** | mock `localStorage` |

Backend hiện có 8 module (AccessControl, Catalog, Customer, Identity, Media, Navigation, Organization, Platform), **không có module Content**. Schema SQL của nhóm (`database_tayho (1).sql`) đã thiết kế sẵn các bảng: `pages`, `page_sections`, `banners`, `articles`, `article_categories`, `article_tags`, `article_tag_map` (+ enum `publish_status`, `section_type`, `banner_placement`, `entity_status`).

**Điểm đáng chú ý ở phía Site (User):**
- `/bai-viet`, `/tin-tuc/[slug]`, `sitemap.ts` đọc bài viết qua `listPublishedArticles()` — hàm này đọc mock. Khi chạy trên server (SSR) nó trả **dữ liệu seed cố định**, nên bài viết Admin vừa sửa **không bao giờ** hiện ra ở Site thật.
- Banner: `PromotionZone` (trang chủ) đọc `listActiveBannersByPlacement`; cùng vấn đề dữ liệu mock.
- Page/Section: Site **chưa render** từ CMS (trang chủ code cứng); chỉ có Navigation (mock) tham chiếu `pageId`.
- SEO (`features/seo`) còn mock và liệt kê bài viết/page qua service Admin.

## 2. Phạm vi đề xuất

**Làm:** 1 module Backend mới **`Content`** gồm 6 thực thể, tích hợp Admin FE (5 mục sidebar) và Site (bài viết + banner).
**Không làm (đợt này):** SEO, Testimonials, Social links (bảng có trong SQL nhưng không thuộc nhóm CONTENT trên sidebar), render trang chủ từ Page/Section.

## 3. Thiết kế Backend

Theo đúng kiến trúc hiện tại (`Domain / Application / Infrastructure / Api`, schema Postgres `content`, `IContentDbContext`, không FK/ProjectReference sang module khác, `AuditableEntity`).

### Thực thể
- **ArticleCategory**: `name`, `slug` (unique), `parentId` (cây, giới hạn độ sâu — xem câu hỏi 4), `sortOrder`, `isActive`.
- **ArticleTag**: `name`, `slug` (unique).
- **Article**: `title`, `slug` (unique), `summary`, `content` (HTML), `featuredMediaId` (chuỗi mờ, không FK — giống `ProductMedia`), `categoryId` (FK ArticleCategory, Restrict), `authorName`, `status` (draft/published/archived), `publishedAt`; bảng nối `ArticleTag` (N-N, thay thế cả danh sách).
- **Page**: `name`, `slug` (unique), `status`, `publishedAt`; **PageSection** thuộc Page (`sectionKind`, `eyebrow`, `heading`, `subheading`, `body`, `mediaId`, `ctaLabel`, `ctaUrl`, `displayOrder`, `isVisible`), xóa Page thì xóa Section (cascade).
- **Banner**: `name`, `desktopMediaId`, `mobileMediaId`, `altText`, `heading`, `subheading`, `ctaLabel`, `ctaUrl`, `placement` (HOME_HERO / HOME_PROMOTION / MENU_HERO / ARTICLE_BANNER), `startAt`, `endAt`, `displayOrder`, `isActive`.

### Endpoint
- Admin (có `[RequirePermission]`): `GET/POST/PUT/DELETE /api/v1/content/{articles|article-categories|article-tags|pages|banners}` và `/api/v1/content/pages/{pageId}/sections`.
- Công khai (`[AllowAnonymous]`, dạng snapshot như `catalog/public`, cache 60s ở phía Site): bài viết đã xuất bản (list + theo slug), danh mục và thẻ đang dùng, banner đang hoạt động theo `placement` trong khoảng `startAt/endAt`.
- Quyền mới (24 mã): `articles.*`, `article-categories.*`, `article-tags.*`, `pages.*`, `banners.*` (mỗi nhóm view/create/update/delete; sections dùng chung `pages.*` như Menu-SP dùng `sales-menus.*`). Gắn quyền view cho 5 mục menu (hiện đang `null`).

### Migration / seed
- Migration `InitialCreate` cho `ContentDbContext`; đăng ký trong Host, Migrator và `PermissionCatalog`.
- Seed dữ liệu ban đầu từ mock FE (3 bài viết, danh mục, thẻ, page/section, banner) bằng file JSON nhúng, **chỉ chạy khi bảng rỗng** (giống `CatalogSeeder`) để Site không bị trống sau khi bỏ mock.

## 4. Tích hợp Frontend

Theo pattern đã dùng cho Catalog/Promotions: viết lại `services/*.service.ts` của từng feature để gọi `adminApi`, bỏ mock + `localStorage`, hook Explorer/Editor dùng `useAsyncData`; không đổi component UI.

- **Admin:** 6 service (`article`, `article-category`, `article-tag`, `page`, `page-section`, `banner`).
- **Site:** thêm `features/content-public` (như `catalog-public`): Server Component gọi thẳng Backend (cache 60s), trình duyệt qua Route Handler công khai `app/api/content/public`. `news.service`, `/bai-viet`, `/tin-tuc/[slug]`, `sitemap.ts` và `PromotionZone` chuyển sang đọc từ đây.
- Dùng chung: `PublishStatusBadge`, `DataExplorer/DataEditor`, `MediaPicker` (đã có), `RichTextEditor` (đã có). Không tạo thành phần dùng chung mới trừ khi lộ ra phần lặp lại khi làm.

## 5. Kế hoạch triển khai (mỗi bước một cặp PR BE + FE, merge tuần tự)

1. **Taxonomy + Articles:** ArticleCategory, ArticleTag, Article (+ public articles, Site `/bai-viet`, sitemap).
2. **Banners:** Banner (+ public banners, `PromotionZone`).
3. **Pages + Sections:** Page, PageSection (chỉ CRUD Admin).
4. Mỗi bước: unit test + integration test (CRUD, quyền, public), migration tăng dần, cập nhật seed menu.

## 6. Cần bạn quyết định (mình không tự suy diễn)

1. **Vị trí:** gộp 6 thực thể vào **một module `Content`** (đề xuất) hay tách (vd. `Articles` riêng, `Cms` cho Page/Banner)?
2. **Làm HTML bài viết an toàn:** nội dung từ trình soạn thảo là HTML, Site render bằng `dangerouslySetInnerHTML`. Đề xuất **sanitize ở Backend khi lưu** (thêm 1 package, ví dụ `HtmlSanitizer`). Đồng ý thêm package hay để Frontend sanitize?
3. **Slug:** hiện `Slug.FromText` nằm trong module Catalog (không module khác được tham chiếu). Đề xuất **chuyển helper này sang `SharedKernel`** (sửa nhẹ Catalog) để dùng chung; hay chấp nhận nhân bản?
4. **Danh mục bài viết:** giới hạn độ sâu cây là bao nhiêu (Catalog là 3 cấp)? Xóa danh mục còn bài viết/danh mục con thì chặn (409) như Catalog?
5. **Xuất bản:** `publishedAt` tự đặt khi chuyển sang `published` (đề xuất) hay Admin tự nhập? Có cần **hẹn giờ xuất bản** không? `archived` ẩn khỏi Site như `draft`?
6. **Banner:** `endAt` hiện chọn theo ngày và hết hạn lúc 00:00 UTC của ngày đó (giống mã giảm giá). Muốn hết hạn **cuối ngày** (giờ Việt Nam) không? Danh sách `placement` giữ cố định 4 giá trị hay cho Admin thêm?
7. **Seed:** seed dữ liệu mẫu bằng `seed` (chạy mỗi lần deploy, chỉ khi rỗng — Site có nội dung ngay) hay chỉ `seed-demo`?
8. **Quyền mới:** chấp nhận tên mã ở mục 3; cấp mặc định cho role nào ngoài SuperAdmin?
9. **Phạm vi đợt này:** đồng ý **không** làm Testimonials/Social links/render trang chủ từ Page-Section? Hay cần thêm?
10. **Thứ tự ưu tiên** ở mục 5 có phù hợp không (đề xuất làm Bài viết trước vì Site đang dùng)?

## 7. Rủi ro đã nhận diện

- Id bài viết/page/banner đổi từ chuỗi mock sang GUID: dữ liệu `localStorage` cũ và các mục tham chiếu mock (Navigation → `pageId`, SEO → `articleId`) sẽ không khớp cho tới khi các nhóm đó cũng chuyển sang Backend.
- `featuredMediaId`/`mediaId` có thể là id mock cũ (`media-...`) hoặc GUID Media — lưu dưới dạng chuỗi mờ như Catalog; Site tự phân giải.
- HTML bài viết là rủi ro XSS lưu trữ nếu không sanitize (câu hỏi 2).
- API công khai bài viết cần giới hạn kích thước/phân trang để không trả toàn bộ nội dung HTML của mọi bài.
