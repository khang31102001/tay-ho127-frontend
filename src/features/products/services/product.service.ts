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
