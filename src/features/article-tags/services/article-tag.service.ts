import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedArticleTag } from "../types/article-tag.types";

/**
 * Admin → Content → Thẻ bài viết, gọi Backend /api/v1/content/article-tags (quyền
 * article-tags.*). `slug` để trống khi tạo → Backend tự sinh từ tên; để trống khi sửa →
 * giữ slug cũ. Xóa thẻ chỉ gỡ nó khỏi các bài viết đang gắn. Site đọc thẻ qua
 * features/content-public.
 */

/** ArticleTagResponse của Backend. */
type ArticleTagDto = {
  id: string;
  name: string;
  slug: string;
};

function toManagedArticleTag(dto: ArticleTagDto): ManagedArticleTag {
  return { id: dto.id, name: dto.name, slug: dto.slug };
}

function toRequest(payload: Omit<ManagedArticleTag, "id">) {
  return { name: payload.name, slug: payload.slug || null };
}

export async function listArticleTags(): Promise<ManagedArticleTag[]> {
  const page = await adminApi.get<PaginatedResult<ArticleTagDto>>("/content/article-tags", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedArticleTag);
}

export async function getArticleTagById(id: string): Promise<ManagedArticleTag> {
  return toManagedArticleTag(await adminApi.get<ArticleTagDto>(`/content/article-tags/${id}`));
}

export async function createArticleTag(payload: Omit<ManagedArticleTag, "id">): Promise<ManagedArticleTag> {
  return toManagedArticleTag(await adminApi.post<ArticleTagDto>("/content/article-tags", toRequest(payload)));
}

export async function updateArticleTag(
  id: string,
  payload: Omit<ManagedArticleTag, "id">,
): Promise<ManagedArticleTag> {
  return toManagedArticleTag(await adminApi.put<ArticleTagDto>(`/content/article-tags/${id}`, toRequest(payload)));
}

export function deleteArticleTag(id: string): Promise<void> {
  return adminApi.delete<void>(`/content/article-tags/${id}`);
}
