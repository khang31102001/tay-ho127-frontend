import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedArticleCategory } from "../types/article-category.types";

/**
 * Admin → Content → Danh mục bài viết, gọi Backend /api/v1/content/article-categories
 * (quyền article-categories.*). Cây tối đa 3 cấp — Backend trả 400 nếu vượt, 409 khi
 * xóa danh mục còn danh mục con/bài viết. `slug` để trống khi tạo → Backend tự sinh
 * từ tên; để trống khi sửa → giữ slug cũ. Site đọc danh mục đang dùng qua
 * features/content-public, không qua file này.
 */

/** ArticleCategoryResponse của Backend. */
type ArticleCategoryDto = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
};

function toManagedArticleCategory(dto: ArticleCategoryDto): ManagedArticleCategory {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    parentId: dto.parentId,
    sortOrder: dto.sortOrder,
    status: dto.isActive ? "active" : "inactive",
  };
}

function toRequest(payload: Omit<ManagedArticleCategory, "id">) {
  return {
    name: payload.name,
    slug: payload.slug || null,
    parentId: payload.parentId,
    sortOrder: payload.sortOrder,
    isActive: payload.status === "active",
  };
}

export async function listArticleCategories(): Promise<ManagedArticleCategory[]> {
  const page = await adminApi.get<PaginatedResult<ArticleCategoryDto>>("/content/article-categories", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedArticleCategory);
}

export async function getArticleCategoryById(id: string): Promise<ManagedArticleCategory> {
  return toManagedArticleCategory(await adminApi.get<ArticleCategoryDto>(`/content/article-categories/${id}`));
}

export async function createArticleCategory(
  payload: Omit<ManagedArticleCategory, "id">,
): Promise<ManagedArticleCategory> {
  return toManagedArticleCategory(
    await adminApi.post<ArticleCategoryDto>("/content/article-categories", toRequest(payload)),
  );
}

export async function updateArticleCategory(
  id: string,
  payload: Omit<ManagedArticleCategory, "id">,
): Promise<ManagedArticleCategory> {
  return toManagedArticleCategory(
    await adminApi.put<ArticleCategoryDto>(`/content/article-categories/${id}`, toRequest(payload)),
  );
}

export function deleteArticleCategory(id: string): Promise<void> {
  return adminApi.delete<void>(`/content/article-categories/${id}`);
}
