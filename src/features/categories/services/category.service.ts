import type { ManagedCategory } from "../types/category.types";
import { SEED_CATEGORIES } from "../mocks/category.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý danh mục thật.
 * Dữ liệu seed (xem ../mocks/category.mock.ts) + đồng bộ 2 chiều với
 * localStorage để không mất khi reload trang. Khi có backend thật, chỉ cần
 * thay nội dung các hàm dưới đây.
 */
const STORAGE_KEY = "tayho-admin-categories";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedCategory[] {
  if (typeof window === "undefined") {
    return SEED_CATEGORIES;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedCategory[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu danh mục admin:", error);
  }

  return SEED_CATEGORIES;
}

function writeStore(categories: ManagedCategory[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error("Không thể lưu dữ liệu danh mục admin:", error);
  }
}

export async function listCategories(): Promise<ManagedCategory[]> {
  await delay();
  return readStore();
}

export async function getCategoryById(id: string): Promise<ManagedCategory | null> {
  await delay();
  return readStore().find((category) => category.id === id) ?? null;
}

export async function createCategory(
  payload: Omit<ManagedCategory, "id">,
): Promise<ManagedCategory> {
  await delay();

  const newCategory: ManagedCategory = { ...payload, id: `cat-${Date.now()}` };

  writeStore([...readStore(), newCategory]);

  return newCategory;
}

export async function updateCategory(
  id: string,
  payload: Omit<ManagedCategory, "id">,
): Promise<ManagedCategory> {
  await delay();

  const updatedCategory: ManagedCategory = { ...payload, id };

  writeStore(readStore().map((category) => (category.id === id ? updatedCategory : category)));

  return updatedCategory;
}

export async function deleteCategory(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((category) => category.id !== id));
}
