/**
 * Nhóm kho ảnh = NƠI media được thêm vào (Sản phẩm, Bài viết, Banner, ...) để lọc/tìm nhanh trong thư viện.
 * Mỗi media thuộc đúng một nhóm. Code và nhãn PHẢI khớp dữ liệu hệ thống Backend tạo sẵn (migration
 * AddMediaCategories, MediaCategoryCodes) — đây là danh sách cố định, không có màn thêm/sửa nhóm.
 */
export const MEDIA_CATEGORIES = [
  { code: "products", label: "Sản phẩm" },
  { code: "articles", label: "Bài viết" },
  { code: "banners", label: "Banner" },
  { code: "page-sections", label: "Section trang" },
  { code: "brand", label: "Thương hiệu" },
  { code: "customers", label: "Khách hàng" },
  { code: "payments", label: "Thanh toán" },
  { code: "seo", label: "SEO" },
  { code: "general", label: "Chung" },
] as const;

export type MediaCategoryCode = (typeof MEDIA_CATEGORIES)[number]["code"];

/** Nhóm mặc định khi nơi thêm media không thuộc nghiệp vụ nào (trang Thư viện Media, link ngoài). */
export const DEFAULT_MEDIA_CATEGORY: MediaCategoryCode = "general";

export function getMediaCategoryLabel(code: string | undefined): string {
  return MEDIA_CATEGORIES.find((category) => category.code === code)?.label ?? "Chưa phân nhóm";
}
