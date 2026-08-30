import type { ManagedArticleTag } from "../types/article-tag.types";
import { SEED_ARTICLE_TAGS } from "../mocks/article-tag.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý thẻ bài viết thật. Dữ liệu seed
 * (xem ../mocks/article-tag.mock.ts) + đồng bộ 2 chiều với localStorage.
 */
const STORAGE_KEY = "tayho-admin-article-tags";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedArticleTag[] {
  if (typeof window === "undefined") {
    return SEED_ARTICLE_TAGS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedArticleTag[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu thẻ bài viết admin:", error);
  }

  return SEED_ARTICLE_TAGS;
}

function writeStore(tags: ManagedArticleTag[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  } catch (error) {
    console.error("Không thể lưu dữ liệu thẻ bài viết admin:", error);
  }
}

export async function listArticleTags(): Promise<ManagedArticleTag[]> {
  await delay();
  return readStore();
}

export async function getArticleTagById(id: string): Promise<ManagedArticleTag | null> {
  await delay();
  return readStore().find((tag) => tag.id === id) ?? null;
}

export async function createArticleTag(
  payload: Omit<ManagedArticleTag, "id">,
): Promise<ManagedArticleTag> {
  await delay();

  const newTag: ManagedArticleTag = { ...payload, id: `arttag-${Date.now()}` };

  writeStore([...readStore(), newTag]);

  return newTag;
}

export async function updateArticleTag(
  id: string,
  payload: Omit<ManagedArticleTag, "id">,
): Promise<ManagedArticleTag> {
  await delay();

  const updatedTag: ManagedArticleTag = { ...payload, id };

  writeStore(readStore().map((tag) => (tag.id === id ? updatedTag : tag)));

  return updatedTag;
}

export async function deleteArticleTag(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((tag) => tag.id !== id));
}
