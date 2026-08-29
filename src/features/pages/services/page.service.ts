import type { ManagedPage } from "../types/page.types";
import { SEED_PAGES } from "../mocks/page.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý Page thật. Dữ liệu seed (xem
 * ../mocks/page.mock.ts) + đồng bộ 2 chiều với localStorage. Khi có backend
 * thật, chỉ cần thay nội dung các hàm dưới đây.
 */
const STORAGE_KEY = "tayho-admin-pages";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedPage[] {
  if (typeof window === "undefined") {
    return SEED_PAGES;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedPage[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu Page admin:", error);
  }

  return SEED_PAGES;
}

function writeStore(pages: ManagedPage[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch (error) {
    console.error("Không thể lưu dữ liệu Page admin:", error);
  }
}

export async function listPages(): Promise<ManagedPage[]> {
  await delay();
  return readStore();
}

export async function getPageById(id: string): Promise<ManagedPage | null> {
  await delay();
  return readStore().find((page) => page.id === id) ?? null;
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  await delay(150);
  return readStore().some((page) => page.slug === slug && page.id !== excludeId);
}

export type PageUpsertInput = {
  name: string;
  slug: string;
  status: ManagedPage["status"];
};

export async function createPage(payload: PageUpsertInput): Promise<ManagedPage> {
  await delay();

  const now = new Date().toISOString();

  const newPage: ManagedPage = {
    ...payload,
    id: `page-${Date.now()}`,
    publishedAt: payload.status === "published" ? now : null,
    createdAt: now,
    updatedAt: now,
  };

  writeStore([...readStore(), newPage]);

  return newPage;
}

export async function updatePage(id: string, payload: PageUpsertInput): Promise<ManagedPage> {
  await delay();

  const current = readStore().find((page) => page.id === id);
  const now = new Date().toISOString();

  const updatedPage: ManagedPage = {
    id,
    ...payload,
    publishedAt:
      payload.status === "published" ? current?.publishedAt ?? now : current?.publishedAt ?? null,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };

  writeStore(readStore().map((page) => (page.id === id ? updatedPage : page)));

  return updatedPage;
}

export async function deletePage(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((page) => page.id !== id));
}
