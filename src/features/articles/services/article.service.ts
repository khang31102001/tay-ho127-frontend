import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedArticle, ManagedArticleListItem } from "../types/article.types";

/**
 * Admin → Content → Bài viết, gọi Backend /api/v1/content/articles (quyền articles.*).
 * Site đọc bài đã xuất bản qua features/content-public, không qua file này.
 *
 * - `content` là HTML từ trình soạn thảo; Backend sanitize khi lưu.
 * - `slug` để trống khi tạo → Backend tự sinh từ tiêu đề (409 nếu slug nhập tay đã dùng);
 *   để trống khi sửa → giữ slug cũ.
 * - `publishedAt` do Backend đặt lần đầu bài chuyển sang "published", không gửi lên.
 * - Danh sách không kèm `content` (nặng) — lấy theo id khi mở Editor.
 * - `tagIds` thay thế toàn bộ thẻ của bài.
 */

/** ArticleListItemResponse của Backend. */
type ArticleListItemDto = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featuredMediaId: string | null;
  categoryId: string | null;
  tagIds: string[];
  authorName: string;
  status: ManagedArticle["status"];
  publishedAt: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

/** ArticleResponse của Backend. */
type ArticleDto = ArticleListItemDto & { content: string };

export type ArticleUpsertInput = Omit<ManagedArticle, "id" | "createdAt" | "updatedAt" | "publishedAt">;

function toManagedArticleListItem(dto: ArticleListItemDto): ManagedArticleListItem {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    summary: dto.summary,
    featuredMediaId: dto.featuredMediaId,
    categoryId: dto.categoryId,
    tagIds: dto.tagIds,
    authorName: dto.authorName,
    status: dto.status,
    publishedAt: dto.publishedAt,
    createdAt: dto.createdAtUtc,
    updatedAt: dto.updatedAtUtc ?? dto.createdAtUtc,
  };
}

function toManagedArticle(dto: ArticleDto): ManagedArticle {
  return { ...toManagedArticleListItem(dto), content: dto.content };
}

function toRequest(payload: ArticleUpsertInput) {
  return {
    title: payload.title,
    slug: payload.slug || null,
    summary: payload.summary,
    content: payload.content,
    featuredMediaId: payload.featuredMediaId,
    categoryId: payload.categoryId,
    tagIds: payload.tagIds,
    authorName: payload.authorName,
    status: payload.status,
  };
}

export async function listArticles(): Promise<ManagedArticleListItem[]> {
  const page = await adminApi.get<PaginatedResult<ArticleListItemDto>>("/content/articles", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedArticleListItem);
}

export async function getArticleById(id: string): Promise<ManagedArticle> {
  return toManagedArticle(await adminApi.get<ArticleDto>(`/content/articles/${id}`));
}

export async function createArticle(payload: ArticleUpsertInput): Promise<ManagedArticle> {
  return toManagedArticle(await adminApi.post<ArticleDto>("/content/articles", toRequest(payload)));
}

export async function updateArticle(id: string, payload: ArticleUpsertInput): Promise<ManagedArticle> {
  return toManagedArticle(await adminApi.put<ArticleDto>(`/content/articles/${id}`, toRequest(payload)));
}

export function deleteArticle(id: string): Promise<void> {
  return adminApi.delete<void>(`/content/articles/${id}`);
}
