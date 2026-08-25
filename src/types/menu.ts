export interface MenuResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: MenuData;
  meta?: Meta;
}

export interface MenuData {
  menu: Menu;
  lookups?: Lookups;
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
  sku?: string;
  slug?: string;
  name?: {
    vi?: string;
    en?: string;
  } | null;
  productType?: string;
  menuGroupCode?: string;
  categoryId?: string;
  subCategoryId?: string;
  unitCode?: string;
  price?: Price;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface Price {
  amount: number;
  currencyCode?: string;
}

export interface Lookups {
  units?: Unit[];
  currencies?: Currency[];
}

export interface Unit {
  code: string;
  name?: string;
  abbreviation?: string;
  isActive?: boolean;
}

export interface Currency {
  code: string;
  name?: string;
  symbol?: string;
  decimalPlaces?: number;
  isActive?: boolean;
}

export interface Meta {
  schemaVersion?: string;
  requestId?: string;
  totalProducts?: number;
  totalCategories?: number;
  totalSubCategories?: number;
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
