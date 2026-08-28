import type { ManagedMenuProduct } from "../types/menu-product.types";
import { SEED_MENU_PRODUCTS } from "../mocks/menu-product.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý liên kết Menu-Product thật. Dữ liệu
 * seed (xem ../mocks/menu-product.mock.ts) + đồng bộ 2 chiều với
 * localStorage.
 */
const STORAGE_KEY = "tayho-admin-menu-products";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedMenuProduct[] {
  if (typeof window === "undefined") {
    return SEED_MENU_PRODUCTS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedMenuProduct[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu Menu-Product:", error);
  }

  return SEED_MENU_PRODUCTS;
}

function writeStore(menuProducts: ManagedMenuProduct[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(menuProducts));
  } catch (error) {
    console.error("Không thể lưu dữ liệu Menu-Product:", error);
  }
}

export async function listMenuProducts(): Promise<ManagedMenuProduct[]> {
  await delay();
  return readStore();
}

export async function getMenuProductById(id: string): Promise<ManagedMenuProduct | null> {
  await delay();
  return readStore().find((item) => item.id === id) ?? null;
}

export async function createMenuProduct(
  payload: Omit<ManagedMenuProduct, "id">,
): Promise<ManagedMenuProduct> {
  await delay();

  const newItem: ManagedMenuProduct = { ...payload, id: `mp-${Date.now()}` };

  writeStore([...readStore(), newItem]);

  return newItem;
}

export async function updateMenuProduct(
  id: string,
  payload: Omit<ManagedMenuProduct, "id">,
): Promise<ManagedMenuProduct> {
  await delay();

  const updatedItem: ManagedMenuProduct = { ...payload, id };

  writeStore(readStore().map((item) => (item.id === id ? updatedItem : item)));

  return updatedItem;
}

export async function deleteMenuProduct(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((item) => item.id !== id));
}
