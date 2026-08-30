import type { PublishStatus } from "@/components/shared/PublishStatusBadge";

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
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
