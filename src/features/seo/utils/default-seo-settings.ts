import type { ManagedSeoSettings } from "../types/seo-settings.types";

/**
 * Giá trị dự phòng khi Backend chưa có bản ghi SEO Settings (chưa chạy `seed`)
 * hoặc không kết nối được — Site vẫn có title/description/robots hợp lý thay vì
 * vỡ trang. Khớp với `SeoSeeder` của Backend; Admin sửa ở SEO → Cài đặt SEO.
 */
export const DEFAULT_SEO_SETTINGS: ManagedSeoSettings = {
  id: "seo-settings",
  defaultTitleTemplate: "%s | Bánh Cuốn Tây Hồ 127",
  defaultDescription: "Bánh cuốn truyền thống, phục vụ nhanh, hương vị gia đình Bắc giữa Sài Gòn.",
  defaultOgImageMediaId: null,
  twitterSite: null,
  twitterCreator: null,
  defaultRobotsIndex: true,
  defaultRobotsFollow: true,
  // /admin (khu quản trị) + các route giao dịch/cá nhân hoá: giỏ hàng, thanh toán, tài khoản, theo dõi đơn.
  robotsDisallowPaths: ["/admin", "/checkout", "/gio-hang", "/tai-khoan", "/don-hang", "/payment"],
  updatedAt: "1970-01-01T00:00:00.000Z",
};
