// Import thẳng type (không qua barrel @/features/modifier-groups) — barrel đó
// re-export cả Explorer/Editor admin "use client". Type-only import bị xóa
// hoàn toàn lúc build nên không ảnh hưởng bundle, nhưng đi thẳng path cho nhất
// quán quy ước toàn repo.
import type { ManagedModifierGroup } from "@/features/modifier-groups/types/modifier-group.types";

export interface MenuResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: MenuData;
}

export interface MenuData {
  menu: Menu;
}

export interface Menu {
  id: string;
  code?: string;
  name?: string;
  defaultCurrencyCode?: string;
  groups: MenuGroup[];
  isActive?: boolean;
}

export interface MenuGroup {
  code?: string;
  name?: string;
  slug?: string;
  sortOrder?: number;
  categories?: Category[];
}

export interface Category {
  id: string;
  code?: string;
  name?: string;
  slug?: string;
  sortOrder?: number;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  code?: string;
  name?: string;
  slug?: string;
  sortOrder?: number;
  products?: Product[];
}

export interface Product {
  id: string;
  slug?: string;
  /** Giữ dạng {vi,en} để tương thích useMenuGrid.ts (product.name?.vi ?? ...), dù site chỉ có bản vi. */
  name?: {
    vi?: string;
    en?: string;
  } | null;
  productType?: string;
  price?: Price;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface Price {
  amount: number;
  currencyCode?: string;
}

// Helper type for UI mapping (Product card)
export type UiProduct = {
  id: number;
  /** Định danh ổn định của Product (ManagedProduct.id), dùng để điều hướng sang trang chi tiết `/thuc-don/[slug]`. */
  slug: string;
  name: string;
  category: "Món mặn" | "Món chay" | "Ăn kèm" | string;
  price: number;
  oldPrice?: number;
  badge?: string;
  rating: number;
  ratingCount: number;
  image: string;
};

/**
 * Dữ liệu hiển thị cho trang chi tiết sản phẩm (`/thuc-don/[slug]`).
 * Khác `UiProduct` ở chỗ `id` là định danh thật (string) thay vì số thứ tự,
 * vì trang chi tiết được truy cập trực tiếp qua slug, không có vị trí trong danh sách.
 *
 * `modifierGroups` lấy từ ManagedProduct.modifierGroupIds (features/modifier-groups)
 * — chỉ import type (không kéo runtime code Admin vào bundle Site), rỗng nếu
 * món không có modifier nào.
 */
export type ProductDetail = Omit<UiProduct, "id"> & {
  id: string;
  description?: string;
  modifierGroups: ManagedModifierGroup[];
};
