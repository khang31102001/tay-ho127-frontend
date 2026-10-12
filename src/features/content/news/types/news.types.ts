/**
 * View model dựng sẵn cho UI News — KHÔNG phải data model mới. Đây là bài viết
 * công khai (features/content-public) đã join sẵn với Media/Category/Tag để
 * component không phải tự resolve từng id. Chỉ cần sửa news.service.ts (nơi
 * build view này) khi nguồn dữ liệu đổi, UI giữ nguyên.
 */
export type NewsArticleSummaryView = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Media gốc (id) — dùng làm fallback ảnh OG; ảnh hiển thị là coverImageUrl. */
  featuredMediaId: string | null;
  coverImageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  tagNames: string[];
  author: string;
  publishedAt: string | null;
  updatedAt: string | null;
  readingTimeMinutes: number;
};

/** Bài đầy đủ cho trang chi tiết — danh sách chỉ cần NewsArticleSummaryView (Backend không trả HTML ở danh sách). */
export type NewsArticleView = NewsArticleSummaryView & {
  /** HTML đã được Backend sanitize khi lưu; nơi render (ArticleContent) vẫn sanitize thêm một lớp. */
  content: string;
};

export type NewsCategoryOption = {
  id: string;
  name: string;
  slug: string;
};
