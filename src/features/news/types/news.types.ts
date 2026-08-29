/**
 * View model dựng sẵn cho UI News — KHÔNG phải data model mới. Đây là
 * ManagedArticle (features/articles) đã join sẵn với Media/Category/Tag để
 * component không phải tự resolve từng id. Khi có CMS/API thật, chỉ cần
 * sửa news.service.ts (nơi build view này), UI giữ nguyên.
 */
export type NewsArticleView = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** HTML thô (đã có thể chứa markup) — sanitize ở nơi render (ArticleContent). */
  content: string;
  coverImageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  tagNames: string[];
  author: string;
  publishedAt: string | null;
  readingTimeMinutes: number;
};

export type NewsCategoryOption = {
  id: string;
  name: string;
  slug: string;
};
