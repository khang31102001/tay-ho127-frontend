/**
 * Hình dạng dữ liệu SEO dùng chung cho mọi page — không phụ thuộc domain cụ
 * thể (Product/Article...). Mỗi page tự map dữ liệu domain của mình về shape
 * này rồi đưa cho buildMetadata().
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
  /** true khi trang không nên xuất hiện trên kết quả tìm kiếm (vd. trang lỗi/preview chưa publish). */
  noindex?: boolean;
};
