/**
 * Hình dạng dữ liệu SEO dùng chung cho mọi page — không phụ thuộc domain cụ
 * thể (Product/Article...). Mỗi page tự map dữ liệu domain của mình về shape
 * này rồi đưa cho buildMetadata().
 *
 * Từ Phase 5 (Storefront Metadata), page có entity quản lý được trong Admin
 * (Product/Article/Homepage — xem src/features/seo) không tự map field thủ
 * công nữa mà gọi `resolveSeoPayloadForEntity()` (features/seo), hàm đó tự
 * điền các field bên dưới theo đúng fallback SEO Override -> Entity Default ->
 * SEO Settings rồi trả về đúng shape này.
 */
export type SeoPayload = {
  title: string;
  description: string;
  /** Đường dẫn tương đối bắt đầu bằng "/", dùng để dựng canonical URL tuyệt đối. */
  path: string;
  /** URL ảnh OG — tương đối hoặc tuyệt đối đều được (metadataBase tự resolve). */
  image?: string;
  /** "article" cho bài viết/tin tức (bật thêm publishedTime/modifiedTime trong OG). */
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  /**
   * true khi trang không nên xuất hiện trên kết quả tìm kiếm (vd. trang lỗi/
   * preview chưa publish). Vẫn giữ nguyên (KHÔNG đổi tên/xoá — nhiều page cũ
   * đang dùng field này) — khi true, luôn thắng robotsIndex/robotsFollow bên
   * dưới (noindex+nofollow tuyệt đối).
   */
  noindex?: boolean;
  /** Ghi đè URL canonical tuyệt đối (vd. từ SeoMetadata.canonicalUrl) — bỏ qua thì tự dựng từ `path`. */
  canonicalUrl?: string;
  /** Mặc định true nếu không truyền — độc lập với `noindex` (chỉ áp dụng khi noindex không phải true). */
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  /** OG/Twitter override riêng — không truyền thì OG dùng title/description, Twitter dùng lại OG. */
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
};
