import type { ManagedProduct } from "../types/product.types";
import { SEED_PRODUCTS } from "../mocks/product.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý sản phẩm thật. Dữ liệu seed (xem
 * ../mocks/product.mock.ts) + đồng bộ 2 chiều với localStorage.
 */
const STORAGE_KEY = "tayho-admin-products";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedProduct[] {
  if (typeof window === "undefined") {
    return SEED_PRODUCTS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedProduct[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu sản phẩm admin:", error);
  }

  return SEED_PRODUCTS;
}

function writeStore(products: ManagedProduct[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Không thể lưu dữ liệu sản phẩm admin:", error);
  }
}

export async function listProducts(): Promise<ManagedProduct[]> {
  await delay();
  return readStore();
}

export async function getProductById(id: string): Promise<ManagedProduct | null> {
  await delay();
  return readStore().find((product) => product.id === id) ?? null;
}

export async function createProduct(
  payload: Omit<ManagedProduct, "id">,
): Promise<ManagedProduct> {
  await delay();

  const newProduct: ManagedProduct = { ...payload, id: `prod-${Date.now()}` };

  writeStore([...readStore(), newProduct]);

  return newProduct;
}

export async function updateProduct(
  id: string,
  payload: Omit<ManagedProduct, "id">,
): Promise<ManagedProduct> {
  await delay();

  const updatedProduct: ManagedProduct = { ...payload, id };

  writeStore(readStore().map((product) => (product.id === id ? updatedProduct : product)));

  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((product) => product.id !== id));
}

export type ProductUpsertInput = {
  /** Có id khớp sản phẩm hiện có → cập nhật; không có/không khớp → tạo mới. */
  id?: string;
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  status: ManagedProduct["status"];
};

/**
 * Tạo/cập nhật nhiều sản phẩm trong 1 lần đọc-ghi store — dùng cho Import
 * hàng loạt (xem features/products/import-export/product-import.service.ts).
 * Chỉ ghi đè các field trong ProductUpsertInput; các field site-display
 * (mediaIds, rating, ratingCount, oldPrice, badge) giữ nguyên khi cập nhật.
 */
export async function bulkUpsertProducts(
  items: ProductUpsertInput[],
): Promise<ManagedProduct[]> {
  await delay();

  const currentById = new Map(readStore().map((product) => [product.id, product]));

  items.forEach((item, index) => {
    const existing = item.id ? currentById.get(item.id) : undefined;

    if (existing) {
      currentById.set(existing.id, {
        ...existing,
        name: item.name,
        categoryId: item.categoryId,
        price: item.price,
        description: item.description,
        status: item.status,
      });
    } else {
      const newId = `prod-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;

      currentById.set(newId, {
        id: newId,
        name: item.name,
        categoryId: item.categoryId,
        price: item.price,
        description: item.description,
        status: item.status,
        mediaIds: [],
        modifierGroupIds: [],
      });
    }
  });

  const merged = Array.from(currentById.values());
  writeStore(merged);

  return merged;
}
