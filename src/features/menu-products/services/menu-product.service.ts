import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedMenuProduct } from "../types/menu-product.types";

/**
 * Admin → Catalog → Liên kết Menu-SP, gọi Backend
 * /api/v1/catalog/sales-menu-products (quyền sales-menus.*). Mỗi sản phẩm chỉ
 * xuất hiện 1 lần trong 1 thực đơn — trùng → 409.
 */

/** SalesMenuProductResponse của Backend. */
type SalesMenuProductDto = {
  id: string;
  salesMenuId: string;
  productId: string;
  priceOverride: number | null;
  sortOrder: number;
  isAvailable: boolean;
};

function toManagedMenuProduct(dto: SalesMenuProductDto): ManagedMenuProduct {
  return {
    id: dto.id,
    menuId: dto.salesMenuId,
    productId: dto.productId,
    priceOverride: dto.priceOverride ?? undefined,
    sortOrder: dto.sortOrder,
    isAvailable: dto.isAvailable,
  };
}

function toRequest(payload: Omit<ManagedMenuProduct, "id">) {
  return {
    salesMenuId: payload.menuId,
    productId: payload.productId,
    priceOverride: payload.priceOverride ?? null,
    sortOrder: payload.sortOrder,
    isAvailable: payload.isAvailable,
  };
}

export async function listMenuProducts(): Promise<ManagedMenuProduct[]> {
  const page = await adminApi.get<PaginatedResult<SalesMenuProductDto>>("/catalog/sales-menu-products", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedMenuProduct);
}

export async function getMenuProductById(id: string): Promise<ManagedMenuProduct> {
  return toManagedMenuProduct(await adminApi.get<SalesMenuProductDto>(`/catalog/sales-menu-products/${id}`));
}

export async function createMenuProduct(payload: Omit<ManagedMenuProduct, "id">): Promise<ManagedMenuProduct> {
  return toManagedMenuProduct(await adminApi.post<SalesMenuProductDto>("/catalog/sales-menu-products", toRequest(payload)));
}

export async function updateMenuProduct(id: string, payload: Omit<ManagedMenuProduct, "id">): Promise<ManagedMenuProduct> {
  return toManagedMenuProduct(await adminApi.put<SalesMenuProductDto>(`/catalog/sales-menu-products/${id}`, toRequest(payload)));
}

export function deleteMenuProduct(id: string): Promise<void> {
  return adminApi.delete<void>(`/catalog/sales-menu-products/${id}`);
}
