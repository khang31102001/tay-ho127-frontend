# SEO Module — Phase 8: QA Report

Kiểm tra hệ thống theo đúng Task 36/Phase 8: Metadata, Canonical, OpenGraph, JSON-LD, Sitemap, Robots, Redirect — trên HTML output thực tế (không chỉ Admin preview), gồm cả `npm run build` + `next start` (production) để loại trừ artifact của dev server.

**Kết luận chung: Toàn bộ chức năng SEO (Phase 2-7) hoạt động đúng như thiết kế.** Phát hiện 1 vấn đề kỹ thuật (không do module SEO gây ra) và 1 khoảng cách kiến trúc đã tự sửa trong lúc QA.

---

## 1. Metadata + Canonical + OpenGraph — PASS

Kiểm tra `generateMetadata()` thực tế trên 8 tình huống (fetch trực tiếp, parse `<head>`):

| Trang | Title | Canonical | Robots | OG Image |
|---|---|---|---|---|
| `/` (Homepage) | ✅ site name | ✅ đúng | `index, follow` | — (chưa cấu hình, đúng) |
| `/thuc-don/product-bc001` (có override) | ✅ đúng SEO Metadata | ✅ đúng | `index, follow` | ✅ resolve đúng từ mediaId |
| `/thuc-don/product-bc003` (không override) | ✅ fallback tên SP | ✅ đúng | `index, follow` | — |
| `/thuc-don/[slug không tồn tại]` | ✅ "Không tìm thấy món ăn" | ✅ đúng | `noindex, nofollow` | — |
| `/bai-viet/[published]` | ✅ đúng | ✅ đúng | `index, follow` | ✅ đúng |
| `/bai-viet/[draft]` | ✅ đúng | ✅ đúng | `noindex, nofollow` (thắng override) | ✅ |
| `/tin-tuc/[cùng bài published]` | ✅ đúng | ✅ đúng (canonical riêng route này) | `index, follow` | ✅ |
| `/tin-tuc/[cùng bài draft]` | ✅ "Không tìm thấy bài viết" (gate publish-only, đúng thiết kế cũ) | ✅ | `noindex, nofollow` | — |

Đã verify thêm bằng cách chỉnh `robotsIndex: false` trực tiếp trên seed `product-bc001` (vì override qua Admin chỉ lưu localStorage, SSR không đọc được — xem mục 5): meta tag đổi đúng thành `noindex, follow`, đã revert ngay sau khi xác nhận.

## 2. JSON-LD / Structured Data — PASS

- **Global Schema** (Organization/Restaurant/WebSite): render đúng 1 lần ở layout, derive đúng từ Brand Settings (tên, phone, địa chỉ, giờ mở cửa, social links).
- **Page Schema Product**: Product + Offer lồng bên trong + BreadcrumbList — đúng 5 script tag/trang (3 global + 2 page), xác nhận bằng DOM parse thực tế (`document.querySelectorAll('script[type="application/ld+json"]')`), không trùng lặp.
- **Page Schema Article**: Article + BreadcrumbList — đúng, tự động **KHÔNG render** khi bài viết chưa publish (test trên bài draft: chỉ còn 3 Global schema, đúng thiết kế).
- **Not-found page**: xác nhận KHÔNG render Product/Breadcrumb schema (chỉ Global) — logic đúng vì `resolveProductPageSchemas()` nằm sau check `if (!data) notFound()`.
- **Custom JSON-LD (Advanced Mode, Task 10)**: test bằng cách bật `isCustomOverride: true` + JSON tuỳ chỉnh trên seed `product-bc001` → xác nhận JSON-LD thực tế trên trang đổi đúng thành nội dung custom, thay thế hoàn toàn schema tự sinh. Đã revert sau khi xác nhận.
- **Validation JSON không hợp lệ (Task 10/33)**: nhập JSON lỗi cú pháp vào Custom JSON-LD trong Admin → bị chặn lưu với thông báo lỗi rõ ràng (2 lớp: inline + popup), không có dữ liệu hỏng nào được persist. Trang Storefront không bao giờ nhận JSON lỗi (có thêm 1 lớp `try/catch` fallback trong resolver).

## 3. Sitemap — PASS

- `curl http://localhost:3000/sitemap.xml` → XML well-formed (parse bằng `xml.etree.ElementTree`), **54 URL, không trùng lặp**.
- Bài viết draft (`uu-dai-thang-nay-giam-10-cho-don-tu-200000d`) **không có mặt** trong sitemap (đúng — `listPublishedArticles()` tự lọc từ trước).
- Test logic lọc `robotsIndex=false` (Task 26, phần tôi thêm ở Phase 7): tạm đặt `product-bc001.robotsIndex=false` trên seed → xác nhận URL đó **biến mất khỏi sitemap.xml** ngay, đã revert.

## 4. Robots.txt — PASS

`curl http://localhost:3000/robots.txt` → đúng danh sách disallow từ SEO Settings (Admin-editable): `/admin`, `/checkout`, `/gio-hang`, `/tai-khoan`, `/don-hang`, `/payment`. Link `Sitemap:` đúng.

## 5. Redirect Management — PASS (đã sửa 1 bug thật trong lúc test)

- **Redirect thật hoạt động đúng**: `curl -o /dev/null -w "%{http_code}"` trên route đã cấu hình redirect trả về **HTTP 301** chính xác (không phải qua `fetch()` browser JS, mà là status code HTTP thô).
- **Redirect `isActive=false` không kích hoạt**: xác nhận route không redirect khi tắt — request đi tiếp bình thường.
- **Validate trùng `source_path`**: nhập lại đúng path đã tồn tại → bị chặn lưu, thông báo "Source path này đã được dùng cho 1 redirect khác.", không tạo dòng trùng.
- **Validate vòng lặp tự-redirect** (source = destination): bị chặn lưu đúng thông báo, không tạo dữ liệu hỏng.
- **BUG PHÁT HIỆN VÀ ĐÃ SỬA**: `src/features/seo/services/seo-settings.service.ts` — dữ liệu `ManagedSeoSettings` cũ đã lưu trong `localStorage` (từ Phase 5, trước khi field `robotsDisallowPaths` được thêm ở Phase 7) thiếu field mới → `form.robotsDisallowPaths.join("\n")` ở `SeoSettingsForm.tsx` throw `TypeError`, làm crash toàn bộ trang **Cài đặt SEO**. Đã sửa `readStore()` để merge với `SEED_SEO_SETTINGS` mặc định cho field còn thiếu (backward-compatible khi schema tiến hoá) — đã verify lại bằng tab mới, không còn lỗi.

## 6. Kiểm tra "combined save" (Task 16 — 1 nút Lưu cho cả Entity + SEO)

- **Edit mode** (Product `product-bc001`): sửa Meta Title trong tab SEO, bấm Lưu 1 lần → cả Product và SEO Metadata cùng được cập nhật đúng.
- **Create mode** (tạo Product mới hoàn toàn): điền tên/giá + Meta Title override trong tab SEO ngay khi tạo mới, bấm Lưu → Product được tạo với id mới (`prod-...`), SEO Metadata được tạo **đúng liên kết với id mới đó** (không phải rác/không liên kết) — xác nhận qua localStorage, và xuất hiện đúng trong SEO Metadata List ngay sau đó. Đã dọn dữ liệu test.

## 7. Regression check

- `npx tsc --noEmit`: PASS. `npm run lint`: PASS (cả 2 lần, đầu và cuối Phase 8).
- `npm run build`: PASS, không warning/error, toàn bộ route (kể cả `app/admin/(dashboard)/seo/**` mới) build thành công, Middleware compile 26.7 kB.
- Categories Explorer (không đổi logic, chỉ thêm tab SEO ở Editor): list vẫn render đúng 30 danh mục, không console error.

## 8. Vấn đề phát hiện — NGOÀI phạm vi module SEO (không tự sửa)

**`notFound()` trả về HTTP 200 thay vì 404.** Phát hiện khi test `/thuc-don/[slug không tồn tại]`, `/tin-tuc/[bài draft]`. Đã cô lập nguyên nhân kỹ:

1. Test trên `next dev` (không có Middleware) → vẫn 200.
2. Test trên **production build sạch** (`npm run build && npm run start`), **tắt hẳn `middleware.ts`** (rebuild lại không có file này) → **vẫn 200**.
3. Kết luận: đây là hành vi có sẵn của cách `notFound()` được gọi trong các page hiện tại (`if (!data) { notFound(); }` — dòng code này đã tồn tại **trước khi có module SEO**, tôi không sửa gì ở đó), **không liên quan gì đến Middleware hay code SEO tôi vừa xây**. Body HTML vẫn render đúng nội dung `app/not-found.tsx` ("Không tìm thấy trang") — chỉ status code HTTP là sai.
4. Đây là vấn đề kỹ thuật SEO thật sự đáng quan tâm (crawler sẽ index nhầm trang lỗi là nội dung hợp lệ) nhưng **nằm ngoài phạm vi "module SEO"** được giao — khuyến nghị mở task riêng để Backend/FE lead điều tra (có thể liên quan cấu hình `next.config.js`, custom error boundary, hoặc phiên bản Next.js 14.2.35 cụ thể).

## 9. Tổng kết

| Hạng mục | Trạng thái |
|---|---|
| Metadata / Canonical / OpenGraph | ✅ PASS |
| JSON-LD (Global + Page + Custom Override) | ✅ PASS |
| Sitemap (well-formed, no dupe, noindex-filter) | ✅ PASS |
| Robots.txt (Admin-editable) | ✅ PASS |
| Redirect (301 thật, validate trùng/vòng lặp, isActive) | ✅ PASS (1 bug tìm thấy & đã sửa) |
| Combined save (create + edit mode) | ✅ PASS |
| Build/Lint/TypeCheck | ✅ PASS |
| `notFound()` → HTTP 200 | ⚠️ Phát hiện, xác nhận KHÔNG do SEO module, ngoài phạm vi, khuyến nghị task riêng |

**Roadmap SEO Module (Phase 0-8) đã hoàn thành đầy đủ.**
