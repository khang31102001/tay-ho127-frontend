import { fetchBackend } from "@/lib/http/backend-fetch";
// Import thẳng type của các feature Catalog (không qua barrel) — barrel của
// chúng re-export cả Explorer/Editor Admin "use client"; xem giải thích đầy đủ
// ở features/menu/services/menu.service.ts.
import type { ManagedCategory } from "@/features/categories/types/category.types";
import type { ManagedMenuProduct } from "@/features/menu-products/types/menu-product.types";
import type { ManagedMenu } from "@/features/menus/types/menu.types";
import type { ManagedModifierGroup } from "@/features/modifier-groups/types/modifier-group.types";
import type { ManagedProduct } from "@/features/products/types/product.types";

/**
 * Catalog ĐANG BÁN cho Customer Site (thực đơn, chi tiết món, giỏ hàng, tạo
 * đơn, kiểm tra mã giảm giá) — 1 lời gọi Backend GET /api/v1/catalog/public
 * (không cần đăng nhập) trả trọn snapshot: chỉ danh mục/sản phẩm/thực đơn đang
 * hoạt động và các dòng Menu-SP còn hàng. Quản lý (thêm/sửa/xóa) Catalog là
 * việc của Admin: services/*.service.ts trong từng feature Catalog.
 *
 * - Server Component: gọi thẳng Backend, cache 60 giây (Admin sửa → Site thấy
 *   trong tối đa 60 giây).
 * - Trình duyệt: qua Route Handler công khai app/api/catalog/public, nhớ kết
 *   quả 60 giây trong trang để nhiều lời gọi (tạo đơn, mua lại...) chỉ tải 1 lần.
 *
 * Backend lỗi/không kết nối được → snapshot rỗng (Site hiện thực đơn trống,
 * không vỡ trang); lỗi được log và không bị nhớ lại.
 */

type PublicCatalogDto = {
  categories: { id: string; name: string; parentId: string | null; sortOrder: number }[];
  products: {
    id: string;
    slug: string;
    name: string;
    categoryId: string;
    price: number;
    oldPrice: number | null;
    description: string | null;
    badge: string | null;
    rating: number | null;
    ratingCount: number | null;
    mediaIds: string[];
    modifierGroupIds: string[];
  }[];
  salesMenus: { id: string; code: string; name: string }[];
  salesMenuProducts: { id: string; salesMenuId: string; productId: string; priceOverride: number | null; sortOrder: number }[];
  modifierGroups: {
    id: string;
    name: string;
    selectionType: ManagedModifierGroup["selectionType"];
    isRequired: boolean;
    options: { id: string; label: string; priceAdjustment: number; isDefault: boolean }[];
  }[];
};

export type PublicCatalog = {
  categories: ManagedCategory[];
  products: ManagedProduct[];
  menus: ManagedMenu[];
  menuProducts: ManagedMenuProduct[];
  modifierGroups: ManagedModifierGroup[];
};

const PUBLIC_CATALOG_REVALIDATE_SECONDS = 60;

const EMPTY_CATALOG: PublicCatalog = { categories: [], products: [], menus: [], menuProducts: [], modifierGroups: [] };

function toPublicCatalog(dto: PublicCatalogDto): PublicCatalog {
  return {
    categories: dto.categories.map((category) => ({
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      status: "active",
    })),
    products: dto.products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      oldPrice: product.oldPrice ?? undefined,
      description: product.description ?? undefined,
      status: "active",
      mediaIds: product.mediaIds,
      modifierGroupIds: product.modifierGroupIds,
      rating: product.rating ?? undefined,
      ratingCount: product.ratingCount ?? undefined,
      badge: product.badge ?? undefined,
    })),
    menus: dto.salesMenus.map((menu) => ({ id: menu.id, code: menu.code, name: menu.name, status: "active" })),
    menuProducts: dto.salesMenuProducts.map((row) => ({
      id: row.id,
      menuId: row.salesMenuId,
      productId: row.productId,
      priceOverride: row.priceOverride ?? undefined,
      sortOrder: row.sortOrder,
      isAvailable: true,
    })),
    modifierGroups: dto.modifierGroups.map((group) => ({
      id: group.id,
      name: group.name,
      selectionType: group.selectionType,
      isRequired: group.isRequired,
      options: group.options,
    })),
  };
}

async function fetchPublicCatalog(): Promise<PublicCatalog> {
  const response =
    typeof window === "undefined"
      ? await fetchBackend("/catalog/public", { next: { revalidate: PUBLIC_CATALOG_REVALIDATE_SECONDS } })
      : await fetch("/api/catalog/public");

  if (!response.ok) {
    throw new Error(`Public catalog: HTTP ${response.status}`);
  }

  return toPublicCatalog((await response.json()) as PublicCatalogDto);
}

let browserCache: { promise: Promise<PublicCatalog>; expiresAt: number } | null = null;

export async function loadPublicCatalog(): Promise<PublicCatalog> {
  if (typeof window === "undefined") {
    try {
      return await fetchPublicCatalog();
    } catch (error) {
      console.error("Không tải được Catalog từ Backend:", error);
      return EMPTY_CATALOG;
    }
  }

  if (!browserCache || browserCache.expiresAt < Date.now()) {
    const promise = fetchPublicCatalog();
    browserCache = { promise, expiresAt: Date.now() + PUBLIC_CATALOG_REVALIDATE_SECONDS * 1000 };
    // Không nhớ lỗi: lần gọi sau thử lại Backend.
    promise.catch(() => {
      if (browserCache?.promise === promise) browserCache = null;
    });
  }

  try {
    return await browserCache.promise;
  } catch (error) {
    console.error("Không tải được Catalog từ Backend:", error);
    return EMPTY_CATALOG;
  }
}

/** Sản phẩm đang bán theo id — nguồn giá tin cậy khi tạo đơn / kiểm tra mã giảm giá. */
export async function getPublicProductById(id: string): Promise<ManagedProduct | null> {
  return (await loadPublicCatalog()).products.find((product) => product.id === id) ?? null;
}

export async function listPublicCategories(): Promise<ManagedCategory[]> {
  return (await loadPublicCatalog()).categories;
}

export async function getPublicModifierGroupById(id: string): Promise<ManagedModifierGroup | null> {
  return (await loadPublicCatalog()).modifierGroups.find((group) => group.id === id) ?? null;
}
