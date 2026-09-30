import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedCategory } from "../types/category.types";

/**
 * Admin → Catalog → Danh mục, gọi Backend /api/v1/catalog/categories (quyền
 * categories.*). Cây tối đa 3 cấp (nhóm → danh mục → danh mục con) — Backend
 * trả 400 nếu vượt, 409 khi xóa danh mục còn danh mục con/sản phẩm.
 * Site đọc danh mục đang bán qua features/catalog-public, không qua file này.
 */

/** CategoryResponse của Backend. */
type CategoryDto = {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
};

function toManagedCategory(dto: CategoryDto): ManagedCategory {
  return {
    id: dto.id,
    name: dto.name,
    parentId: dto.parentId,
    sortOrder: dto.sortOrder,
    status: dto.isActive ? "active" : "inactive",
  };
}

function toRequest(payload: Omit<ManagedCategory, "id">) {
  return {
    name: payload.name,
    parentId: payload.parentId,
    sortOrder: payload.sortOrder,
    isActive: payload.status === "active",
  };
}

export async function listCategories(): Promise<ManagedCategory[]> {
  const page = await adminApi.get<PaginatedResult<CategoryDto>>("/catalog/categories", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedCategory);
}

export async function getCategoryById(id: string): Promise<ManagedCategory> {
  return toManagedCategory(await adminApi.get<CategoryDto>(`/catalog/categories/${id}`));
}

export async function createCategory(payload: Omit<ManagedCategory, "id">): Promise<ManagedCategory> {
  return toManagedCategory(await adminApi.post<CategoryDto>("/catalog/categories", toRequest(payload)));
}

export async function updateCategory(id: string, payload: Omit<ManagedCategory, "id">): Promise<ManagedCategory> {
  return toManagedCategory(await adminApi.put<CategoryDto>(`/catalog/categories/${id}`, toRequest(payload)));
}

export function deleteCategory(id: string): Promise<void> {
  return adminApi.delete<void>(`/catalog/categories/${id}`);
}
