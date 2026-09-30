import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedProduct } from "../types/product.types";

/**
 * Admin → Catalog → Sản phẩm, gọi Backend /api/v1/catalog/products (quyền
 * products.*). Site đọc sản phẩm đang bán qua features/catalog-public.
 *
 * - `slug` để trống khi tạo → Backend tự sinh từ tên; để trống khi sửa → giữ slug cũ.
 * - `mediaIds`/`modifierGroupIds` là danh sách CÓ THỨ TỰ, gửi lên thay thế toàn bộ.
 * - Xóa sản phẩm cũng gỡ nó khỏi mọi thực đơn (đơn hàng cũ giữ bản chụp riêng).
 */

/** ProductResponse của Backend. */
type ProductDto = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  oldPrice: number | null;
  description: string | null;
  isActive: boolean;
  badge: string | null;
  rating: number | null;
  ratingCount: number | null;
  mediaIds: string[];
  modifierGroupIds: string[];
};

function toManagedProduct(dto: ProductDto): ManagedProduct {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    categoryId: dto.categoryId,
    price: dto.price,
    oldPrice: dto.oldPrice ?? undefined,
    description: dto.description ?? undefined,
    status: dto.isActive ? "active" : "inactive",
    badge: dto.badge ?? undefined,
    rating: dto.rating ?? undefined,
    ratingCount: dto.ratingCount ?? undefined,
    mediaIds: dto.mediaIds,
    modifierGroupIds: dto.modifierGroupIds,
  };
}

export type ProductUpsertInput = Omit<ManagedProduct, "id">;

function toRequest(payload: ProductUpsertInput) {
  return {
    name: payload.name,
    slug: payload.slug.trim() || null,
    categoryId: payload.categoryId,
    price: payload.price,
    oldPrice: payload.oldPrice ?? null,
    description: payload.description?.trim() || null,
    isActive: payload.status === "active",
    badge: payload.badge?.trim() || null,
    rating: payload.rating ?? null,
    ratingCount: payload.ratingCount ?? null,
    mediaIds: payload.mediaIds,
    modifierGroupIds: payload.modifierGroupIds,
  };
}

export async function listProducts(): Promise<ManagedProduct[]> {
  const page = await adminApi.get<PaginatedResult<ProductDto>>("/catalog/products", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedProduct);
}

export async function countProducts(): Promise<number> {
  return (await adminApi.get<PaginatedResult<ProductDto>>("/catalog/products", { params: { pageSize: 1 } })).totalItems;
}

export async function getProductById(id: string): Promise<ManagedProduct> {
  return toManagedProduct(await adminApi.get<ProductDto>(`/catalog/products/${id}`));
}

export async function createProduct(payload: ProductUpsertInput): Promise<ManagedProduct> {
  return toManagedProduct(await adminApi.post<ProductDto>("/catalog/products", toRequest(payload)));
}

export async function updateProduct(id: string, payload: ProductUpsertInput): Promise<ManagedProduct> {
  return toManagedProduct(await adminApi.put<ProductDto>(`/catalog/products/${id}`, toRequest(payload)));
}

export function deleteProduct(id: string): Promise<void> {
  return adminApi.delete<void>(`/catalog/products/${id}`);
}
