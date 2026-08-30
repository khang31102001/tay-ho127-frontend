import type { ManagedArticle } from "../types/article.types";
import { SEED_ARTICLES } from "../mocks/article.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý bài viết thật. Dữ liệu seed (xem
 * ../mocks/article.mock.ts) + đồng bộ 2 chiều với localStorage.
 */
const STORAGE_KEY = "tayho-admin-articles";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedArticle[] {
  if (typeof window === "undefined") {
    return SEED_ARTICLES;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedArticle[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu bài viết admin:", error);
  }

  return SEED_ARTICLES;
}

function writeStore(articles: ManagedArticle[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch (error) {
    console.error("Không thể lưu dữ liệu bài viết admin:", error);
  }
}

export async function listArticles(): Promise<ManagedArticle[]> {
  await delay();
  return readStore();
}

export async function getArticleById(id: string): Promise<ManagedArticle | null> {
  await delay();
  return readStore().find((article) => article.id === id) ?? null;
}

/**
 * Lấy bài viết theo slug bất kể trạng thái (kể cả draft/archived) — dùng cho
 * link Preview trong Admin và trang chi tiết bài viết (Site truy cập trực
 * tiếp qua URL vẫn xem được bài chưa publish, giống pattern preview thông
 * thường). Danh sách công khai (`/bai-viet`) phải dùng `listPublishedArticles`,
 * không dùng hàm này.
 */
export async function getArticleBySlug(slug: string): Promise<ManagedArticle | null> {
  await delay();
  return readStore().find((article) => article.slug === slug) ?? null;
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  await delay(150);
  return readStore().some((article) => article.slug === slug && article.id !== excludeId);
}

/** Site (danh sách công khai `/bai-viet`) chỉ được gọi hàm này. */
export async function listPublishedArticles(): Promise<ManagedArticle[]> {
  await delay();

  return readStore()
    .filter((article) => article.status === "published")
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export type ArticleUpsertInput = Omit<ManagedArticle, "id" | "createdAt" | "updatedAt" | "publishedAt">;

export async function createArticle(payload: ArticleUpsertInput): Promise<ManagedArticle> {
  await delay();

  const now = new Date().toISOString();

  const newArticle: ManagedArticle = {
    ...payload,
    id: `article-${Date.now()}`,
    publishedAt: payload.status === "published" ? now : null,
    createdAt: now,
    updatedAt: now,
  };

  writeStore([...readStore(), newArticle]);

  return newArticle;
}

export async function updateArticle(
  id: string,
  payload: ArticleUpsertInput,
): Promise<ManagedArticle> {
  await delay();

  const current = readStore().find((article) => article.id === id);
  const now = new Date().toISOString();

  const updatedArticle: ManagedArticle = {
    id,
    ...payload,
    publishedAt:
      payload.status === "published" ? current?.publishedAt ?? now : current?.publishedAt ?? null,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };

  writeStore(readStore().map((article) => (article.id === id ? updatedArticle : article)));

  return updatedArticle;
}

export async function deleteArticle(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((article) => article.id !== id));
}
