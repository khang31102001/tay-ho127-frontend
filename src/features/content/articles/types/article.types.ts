import type { PublishStatus } from "@/shared/components/PublishStatusBadge";

export type ManagedArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  /** HTML từ RichTextEditor (Tiptap) — Site phải sanitize khi render (xem risk Phase 01/08). */
  content: string;
  featuredMediaId: string | null;
  categoryId: string | null;
  tagIds: string[];
  authorName: string;
  status: PublishStatus;
  /** Hiện ở khối "Tin nổi bật" của trang /tin-tuc. */
  isFeatured: boolean;
  /** Thứ tự trong khối nổi bật (số nhỏ lên trước); Backend xóa về null khi bỏ tick nổi bật. */
  featuredOrder: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Dòng của danh sách Admin — Backend không trả `content` (HTML) ở danh sách. */
export type ManagedArticleListItem = Omit<ManagedArticle, "content">;

/** Giới hạn từ của nội dung bài viết — trùng với Article.MaxContentWords ở Backend. */
export const ARTICLE_CONTENT_MAX_WORDS = 5000;

/** Giới hạn thứ tự nổi bật — trùng với Article.MaxFeaturedOrder ở Backend. */
export const ARTICLE_FEATURED_ORDER_MAX = 9999;
