/**
 * Nội dung CÔNG KHAI của Site (bài viết đã xuất bản + danh mục/thẻ đang dùng) —
 * khác hẳn model Admin (features/articles...): không có draft/archived, không
 * có mốc tạo, kèm thời gian đọc do Backend tính.
 */

export type PublicArticleSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  featuredMediaId: string | null;
  categoryId: string | null;
  tagIds: string[];
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
};

/** Bài viết đầy đủ — `content` là HTML đã được Backend sanitize khi lưu. */
export type PublicArticle = PublicArticleSummary & { content: string };

export type PublicArticleCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
};

export type PublicArticleTag = {
  id: string;
  name: string;
  slug: string;
};

export type PublicTaxonomy = {
  categories: PublicArticleCategory[];
  tags: PublicArticleTag[];
};
