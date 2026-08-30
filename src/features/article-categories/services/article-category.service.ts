import type { ManagedArticleCategory } from "../types/article-category.types";
import { SEED_ARTICLE_CATEGORIES } from "../mocks/article-category.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý danh mục bài viết thật. Dữ liệu seed
 * (xem ../mocks/article-category.mock.ts) + đồng bộ 2 chiều với localStorage.
 */
const STORAGE_KEY = "tayho-admin-article-categories";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedArticleCategory[] {
  if (typeof window === "undefined") {
    return SEED_ARTICLE_CATEGORIES;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedArticleCategory[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu danh mục bài viết admin:", error);
  }

  return SEED_ARTICLE_CATEGORIES;
}

function writeStore(categories: ManagedArticleCategory[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error("Không thể lưu dữ liệu danh mục bài viết admin:", error);
  }
}

export async function listArticleCategories(): Promise<ManagedArticleCategory[]> {
  await delay();
  return readStore();
}

export async function getArticleCategoryById(id: string): Promise<ManagedArticleCategory | null> {
  await delay();
  return readStore().find((category) => category.id === id) ?? null;
}

export async function createArticleCategory(
  payload: Omit<ManagedArticleCategory, "id">,
): Promise<ManagedArticleCategory> {
  await delay();

  const newCategory: ManagedArticleCategory = { ...payload, id: `artcat-${Date.now()}` };

  writeStore([...readStore(), newCategory]);

  return newCategory;
}

export async function updateArticleCategory(
  id: string,
  payload: Omit<ManagedArticleCategory, "id">,
): Promise<ManagedArticleCategory> {
  await delay();

  const updatedCategory: ManagedArticleCategory = { ...payload, id };

  writeStore(
    readStore().map((category) => (category.id === id ? updatedCategory : category)),
  );

  return updatedCategory;
}

export async function deleteArticleCategory(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((category) => category.id !== id));
}
