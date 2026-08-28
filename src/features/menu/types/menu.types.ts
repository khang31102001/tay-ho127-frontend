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
  name: string;
  category: "Món mặn" | "Món chay" | "Ăn kèm" | string;
  price: number;
  oldPrice?: number;
  badge?: string;
  rating: number;
  ratingCount: number;
  image: string;
};
