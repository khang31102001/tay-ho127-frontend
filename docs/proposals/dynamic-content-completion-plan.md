# Kế hoạch hoàn thiện dữ liệu động & xóa hard-code / mock

Ngày quét: 2026-10-04. Nhánh: `feat/brand-branch-profile`.
Nguồn: lịch sử các phiên chat của project + quét tĩnh FE (`fontend`) và BE (`backend`).
Đây là **kế hoạch**, chưa sửa code. Các mục "Cần xác nhận" phải được chốt trước khi làm.

---

## 1. Bối cảnh từ các phiên chat gần đây

| Phiên | Kết quả chính |
|---|---|
| Gộp hai source FE (PR #18) | Gộp SEO + Catalog vào `main` FE; xóa worktree phụ. Luồng cần Backend thật chưa test tay. |
| Admin UI refactor sidebar/header (PR #19) | Sidebar lấy menu từ Backend theo quyền. |
| Kiểm tra API tích hợp FE (không có PR) | `tsc`/lint sạch; ~100 lệnh `adminApi` khớp controller BE. **Chưa chạy runtime** (máy không có Docker/Postgres). Phát hiện Navigation website còn mock; đang bàn gộp với Menu quản trị (chưa chốt). |
| Lỗi 500 trang chi tiết Tin tức (PR #27) | Đã sửa, merge. |
| Backend migration + seed SEO (PR #13) | Seed metadata trang chủ + redirect `/menu → /thuc-don` lên Render. Metadata theo sản phẩm/bài viết **chưa seed** (cần nội dung từ chủ site). |
| Sales module (PR #14/#15/#29) | Orders, payments, delivery/payment methods, order settings, promotions, customer auth nối Backend. Migration `AddBranchContactAndBrandProfile` đã chạy trên Render. |
| Commit `b219640` | Tách Chi nhánh / Thông tin thương hiệu, chuyển sang menu Tổ chức. |

Dữ liệu thừa trên DB Render: chi nhánh "Smoke Brand renamed", "Manager Brand" (test cũ), tên chi nhánh chính vẫn "Main Brand".

Các phiên ở `webiste đào tạo` và `Project\Report` là project khác, không đưa vào.

---

## 2. Hiện trạng Backend (11 module)

AccessControl, Catalog, Content, Customer, Identity, Media, Navigation, Organization, Platform, Sales, Seo — mỗi module có migration + seeder. Test: UnitTests, ArchitectureTests, IntegrationTests (có ~25 file: Auth, Catalog, Content, Sales, Seo metadata/redirects/schemas, BrandProfile...).

**Thiếu/chưa rõ ở BE**
- Không có integration test cho `SeoSettings` (chỉ metadata/redirects/schemas) và `PublicSeo`.
- Không có module/bảng cho: **menu Site (header/footer/mobile)**, **đánh giá khách hàng (testimonials)**, **yêu thích (favorites)**, **quên mật khẩu khách**, **Google sign-in khách**, **nội dung trang chủ (story/experience/hero)**.
- Seed chưa đủ cho site hoàn chỉnh: metadata sản phẩm/bài viết/trang, tên chi nhánh chính, nội dung trang chủ.

---

## 3. Danh sách module còn thiếu / mock / hard-code (FE)

### A. Còn MOCK (localStorage hoặc seed) — cần module Backend

| # | Hạng mục | Vị trí FE | Ảnh hưởng |
|---|---|---|---|
| A1 | **Navigation website** (header/footer/mobile) | `features/navigation` (`mocks/navigation.mock.ts`, `createMockStore`, key `tayho-admin-navigation-*`) | Admin sửa menu chỉ lưu trong trình duyệt admin; khách không thấy thay đổi. `Header`/`Footer` dùng `useLiveNavigation` đọc mock. |
| A2 | **Testimonials** (đánh giá khách) | `features/home/mocks/testimonials.mock.ts`, `testimonial.service.ts` | Trang chủ hiện dữ liệu cố định, không có màn admin. |
| A3 | **Favorites** (món yêu thích) | `features/favorites/services/favorite.service.ts` (localStorage `tayho-favorites`) | Mất khi đổi thiết bị/đăng xuất; khách đăng nhập không đồng bộ. |
| A4 | **Quên mật khẩu** | `app/api/auth/forgot-password/route.ts` (mock, delay 650ms) | Luôn "thành công", không gửi gì. |
| A5 | **Google sign-in** | `AuthModal.tsx` `handleGoogleLogin` | Chưa nối. |
| A6 | **Media seed phía Site** | `features/media/mocks/media.mock.ts` (hợp nhất trong `listMedia()`) | Id mock còn bị nội dung mock tham chiếu; ảnh host ngoài `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` bị loại. |
| A7 | **Mock delivery/payment methods** | `features/delivery-methods/mocks`, `features/payment-methods/mocks` | Service đã gọi Backend; cần xác nhận file mock còn ai import không → xóa nếu mồ côi. |
| A8 | **Giỏ hàng (cart)** | `features/cart/services/cart.service.ts` (localStorage) | Chủ ý state phía trình duyệt; chỉ cần quyết định có cần Cart phía BE không (xem Cần xác nhận). |

### B. HARD-CODE trong code Site (cần chuyển sang dữ liệu Backend)

| # | Hạng mục | Vị trí |
|---|---|---|
| B1 | Tên, tagline, địa chỉ, SĐT, giờ mở cửa, link MXH (facebook/instagram/tiktok/shopee/web) | `src/data/site.ts` → dùng bởi `Footer`, `CTASection`, `MenuHero`, `Logo`, `build-metadata`, `site-url`, `app/layout.tsx`, `app/(site)/page.tsx`, `AdminGuard`, `app-providers`. BE đã có `GET /organization/public/brand` (brand profile + liên hệ chi nhánh chính) nhưng Site mới chỉ dùng cho SEO JSON-LD. |
| B2 | Địa chỉ/giờ/SĐT/nhãn trong hero | `features/home/components/TopHero.tsx` (dòng ~48–105) |
| B3 | Link Facebook + Google Maps cứng | `components/layout/FloatingActions.tsx` (dòng 20–23) — còn **khác** link Facebook trong `site.ts` (`banhcuontayho127` vs `tayho127`) |
| B4 | Số liệu thống kê "60 năm / món / khách / 5 sao", câu chuyện Michelin | `features/home/components/ExperienceSection.tsx` |
| B5 | Câu chuyện thương hiệu 3 đoạn + "Nửa thế kỷ…" | `features/home/components/StorySection.tsx` |
| B6 | Nội dung/CTA mặc định hero, FAQ, fallback banner | `PromotionZone.tsx` (fallback cố ý — giữ), `TopHero.tsx` |
| B7 | Tiêu đề metadata gốc cứng | `app/layout.tsx` ("Bánh cuốn truyền thống") |
| B8 | Ảnh tài sản (`/images/...`) | `site.assets` — chấp nhận được (tài sản tĩnh); chỉ logo nên cho override từ brand profile |
| B9 | `PermissionEditor`, `roles`... nhiều file có chuỗi VN trong form | Đây là nhãn UI, **không** phải dữ liệu — không đổi |

### C. Đã nối Backend (không cần làm lại, chỉ cần test runtime)
Users, Roles, Permissions, Admin menus, Organization/Brands/Departments, Brand profile, Platform (fiscal years, settings, audit), Media, Categories, Products, Menus, Menu-products, Modifier groups, Promotions, Content (Pages, Page sections, Banners, Articles, Categories, Tags), Customers (+addresses), Delivery/Payment methods, Order options/settings, Orders, Payments, Payment page, SEO (settings/metadata/schema/redirects), Customer auth (login/register/logout/session).

---

## 4. Kế hoạch thực hiện (FE → BE → DB → Migration → Test)

Nguyên tắc: mỗi giai đoạn là **một PR nhỏ**, build/lint/tsc xanh trước khi sang giai đoạn sau; không đổi UI/route nếu không cần.

### Giai đoạn 0 — Chuẩn bị môi trường (chặn mọi bước test)
1. Dựng Backend chạy được ở máy local: Docker Postgres + `AdminPlatform.Migrator` (`migrate` + `seed` + `seed-demo`) + `docker-compose.yml`. (Phiên trước kết luận máy này chưa có Docker/Postgres — cần cài hoặc dùng Render staging.)
2. Đặt `BACKEND_API_URL` trong `.env.local`; kiểm tra `/api/catalog/public` trả dữ liệu thật.
3. Dọn DB Render: xóa chi nhánh test "Smoke/Manager Brand", đổi tên chi nhánh chính. **Cần bạn đồng ý trước.**
4. Chốt các câu hỏi ở mục 5.

### Giai đoạn 1 — Thông tin thương hiệu/liên hệ → bỏ `site.ts` hard-code (B1–B3, B7)
Rủi ro thấp nhất, dùng được endpoint BE đã có.
- **FE**: tạo `getSiteIdentity()` (server-only, cache 60s, fallback = giá trị mặc định tối thiểu) trong `features/brand-profile` (đã có `brand-public.service.ts`); `Footer`, `CTASection`, `MenuHero`, `TopHero`, `FloatingActions`, `app/layout.tsx` nhận dữ liệu qua props/Server Component. Giữ `site.assets` (ảnh tĩnh) và một `FALLBACK` nhỏ cho lúc BE sập.
- **BE**: kiểm tra `GET /organization/public/brand` đã trả đủ: tagline, logo, địa chỉ, SĐT, giờ mở cửa, link MXH, toạ độ/link bản đồ. Thiếu field nào thì thêm (cần migration nếu thêm cột).
- **DB/Seed**: seed brand profile + chi nhánh chính với đúng dữ liệu đang nằm trong `site.ts` (idempotent, không ghi đè chỉnh sửa admin).
- **Test**: integration test public brand; kiểm tra tay Footer/Hero/CTA đổi theo Admin sau ≤60s.

### Giai đoạn 2 — Navigation website lên Backend (A1)
Phụ thuộc quyết định ở mục 5 (gộp với menu admin hay module riêng).
- **BE**: bảng menu Site (hoặc cột `scope`), controller admin CRUD + `GET /navigation/public/{location}` (anonymous, chỉ trả menu Site, **không bao giờ** trả menu admin). Migration + seed header/footer/mobile = nội dung `navigation.mock.ts` hiện tại.
- **FE**: viết lại `navigation.service.ts` dùng `adminApi` (admin) + server fetch public (Site); xóa `mocks/navigation.mock.ts`, `createMockStore` nếu không còn consumer; `Header`/`Footer` nhận menu từ server, bỏ refetch localStorage.
- **Test**: integration test CRUD + test "public không lộ menu admin"; kiểm tra tay đổi menu trong admin → Site đổi.

### Giai đoạn 3 — Nội dung trang chủ động (B4, B5, B6)
Cách ít tốn nhất: dùng **Page + Page Sections đã có** (module Content) thay vì bảng mới.
- **BE**: thêm các `sectionKind` cần thiết (story, stats, experience) nếu chưa có; seed một Page `home` với các section = nội dung đang hard-code.
- **FE**: `StorySection`, `ExperienceSection`, `TopHero` đọc section từ `content-public`; giữ fallback ngắn để trang chủ không trống.
- **Test**: sửa section trong admin → trang chủ đổi; xóa section → fallback hiển thị, không lỗi.

### Giai đoạn 4 — Testimonials (A2)
- **BE**: module nhỏ trong Content (`testimonials`: tên, nội dung, rating, avatar media, thứ tự, bật/tắt) + admin CRUD + `GET .../public/testimonials`. Migration + seed từ `testimonials.mock.ts`.
- **FE**: `features/testimonials` admin (Explorer/Editor dùng template có sẵn) + `listTestimonials()` gọi public; xóa mock.
- **Test**: CRUD integration test; trang chủ hiển thị đúng, rỗng thì ẩn section.

### Giai đoạn 5 — Tài khoản khách: quên mật khẩu, favorites, Google (A3–A5)
- **Quên mật khẩu (A4)**: chốt kênh gửi (SMS/Zalo/email). Hiện form chỉ nhận số điện thoại → BE chưa có nhà cung cấp SMS. Nếu chưa có thì **ẩn tính năng** thay vì để mock "thành công giả".
- **Favorites (A3)**: BE `customer/favorites` (productId, customerId, unique) + FE: khách đã đăng nhập dùng API, khách vãng lai giữ localStorage rồi gộp khi đăng nhập.
- **Google (A5)**: cần Google OAuth client; nếu chưa có thì ẩn nút.
- **Test**: integration test + kiểm tra tay đăng nhập/đăng xuất.

### Giai đoạn 6 — Dọn mock & dead code (A6, A7)
- Xóa `delivery-methods/mocks`, `payment-methods/mocks`, `media/mocks` khi hết consumer (grep trước); loại phần "mock seed" khỏi `listMedia()`, đổi tham chiếu id mock sang id Backend.
- Xóa `src/mocks/create-mock-store.ts` khi không còn dùng; cập nhật `CLAUDE.md` (bảng feature + mục "mock pattern").
- Kiểm tra `lib/http/api-types.ts` còn "MOCK CONTRACT" và `navigation.api.ts`, `order-option-api.ts` còn dùng client `api` không.

### Giai đoạn 7 — SEO dữ liệu còn thiếu
- Seed metadata cho sản phẩm/bài viết/trang (lookup GUID thật qua slug) — **cần chủ site cung cấp title/description**, không tự bịa.
- Bổ sung integration test `SeoSettings` + `PublicSeo`.

### Giai đoạn 8 — Kiểm thử toàn diện & chốt
1. BE: `dotnet build`, `dotnet test` (Unit + Architecture + Integration) xanh.
2. DB: chạy `migrate` từ DB trống + `seed` hai lần liên tiếp (idempotent) trên Postgres sạch; chạy trên Render staging.
3. FE: `npx tsc --noEmit`, `npm run lint`, `npm run build` (80+ trang, không `ECONNREFUSED` khi BE chạy).
4. Smoke thủ công/preview, theo **checklist dữ liệu động**: sửa mỗi mục trong Admin → xác nhận Site đổi (≤60s) cho: brand/liên hệ, menu header/footer, banner, trang chủ, thực đơn/giá, bài viết, testimonial, SEO.
5. Luồng đặt hàng: thêm giỏ → mã giảm giá → COD và QR → admin xác nhận thanh toán → khách xem đơn (`docs/sales-smoke-test.ps1` đã có).
6. Phân quyền: tài khoản nhân viên không có quyền mới (`brand-profile.*`, navigation…) → không thấy màn, API trả 403.
7. Quét lần cuối: `grep` không còn `MOCK CONTRACT`, `SEED_`, `createMockStore`, số điện thoại/địa chỉ cứng ngoài fallback.

---

## 5. Cần xác nhận trước khi làm

1. **Navigation**: gộp chung bảng với menu admin (cột `scope`, một bộ UI) hay tách module `site-navigation`? (đề xuất ở phiên trước: gộp mô hình + hai endpoint đọc riêng.)
2. **Quên mật khẩu**: dùng kênh nào (SMS/Zalo/email)? Chưa có thì ẩn.
3. **Google sign-in**: có Google OAuth client không? Chưa có thì ẩn nút.
4. **Cart**: giữ localStorage hay lưu giỏ phía BE?
5. **Nội dung trang chủ** (câu chuyện, số liệu, Michelin): dùng nội dung hiện tại làm seed — đúng không? Số "60 năm / 1972" trong 2 section đang **mâu thuẫn** nhau về nghĩa (60 năm vs "hơn 5 thập kỷ"), cần chốt số liệu thật.
6. **Link Facebook** đúng là `tayho127` hay `banhcuontayho127`?
7. Dọn các chi nhánh test trên DB Render — đồng ý xóa?
8. Môi trường test: cài Docker/Postgres local hay chỉ test trên Render staging?

---

## 6. Rủi ro

- Chưa có lần chạy runtime thật nào của toàn bộ FE↔BE từ khi gộp (chỉ kiểm tĩnh).
- Migration trên Render là dữ liệu thật: mỗi migration mới cần backup trước.
- Backend Render phải deploy từ `main` thì endpoint mới (brand-profile…) mới có.
- Role nhân viên phải được cấp quyền mới sau mỗi module thêm quyền.
