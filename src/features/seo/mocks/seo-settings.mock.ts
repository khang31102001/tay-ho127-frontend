import type { ManagedSeoSettings } from "../types/seo-settings.types";

/**
 * MOCK CONTRACT — singleton, giống pattern brand_settings.mock.ts. Seed vài
 * giá trị khởi tạo từ src/data/site.ts để Admin có dữ liệu thật ngay khi mở
 * SEO Settings lần đầu — đây là 2 nguồn tách biệt (sửa ở đây chưa ảnh hưởng
 * site.ts), giống đúng quan hệ brand_settings <-> site.ts đã có.
 */
export const SEED_SEO_SETTINGS: ManagedSeoSettings = {
  id: "seo-settings",
  defaultTitleTemplate: "%s | Bánh Cuốn Tây Hồ 127",
  defaultDescription: "Bánh cuốn truyền thống, phục vụ nhanh, hương vị gia đình Bắc giữa Sài Gòn.",
  defaultOgImageMediaId: null,
  twitterSite: null,
  twitterCreator: null,
  defaultRobotsIndex: true,
  defaultRobotsFollow: true,
  // Mặc định đề xuất theo audit routing thực tế (seo-architecture-analysis.md
  // mục 8.3): /admin (khu quản trị) + /checkout (đã có sẵn trong robots.ts cũ)
  // + các route giao dịch/cá nhân hoá phát hiện thêm (giỏ hàng, tài khoản, theo
  // dõi đơn, phiên thanh toán). Admin có thể sửa lại tại SEO Settings bất kỳ lúc nào.
  robotsDisallowPaths: ["/admin", "/checkout", "/gio-hang", "/tai-khoan", "/don-hang", "/payment"],
  updatedAt: "2026-01-01T00:00:00.000Z",
};
