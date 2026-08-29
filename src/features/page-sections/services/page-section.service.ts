import type { ManagedPageSection } from "../types/page-section.types";
import { SEED_PAGE_SECTIONS } from "../mocks/page-section.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý Section thật. Dữ liệu seed (xem
 * ../mocks/page-section.mock.ts) + đồng bộ 2 chiều với localStorage.
 */
const STORAGE_KEY = "tayho-admin-page-sections";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedPageSection[] {
  if (typeof window === "undefined") {
    return SEED_PAGE_SECTIONS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedPageSection[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu Section admin:", error);
  }

  return SEED_PAGE_SECTIONS;
}

function writeStore(sections: ManagedPageSection[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  } catch (error) {
    console.error("Không thể lưu dữ liệu Section admin:", error);
  }
}

export async function listSectionsByPageId(pageId: string): Promise<ManagedPageSection[]> {
  await delay();

  return readStore()
    .filter((section) => section.pageId === pageId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getSectionById(id: string): Promise<ManagedPageSection | null> {
  await delay();
  return readStore().find((section) => section.id === id) ?? null;
}

export type PageSectionUpsertInput = Omit<ManagedPageSection, "id">;

export async function createSection(
  payload: PageSectionUpsertInput,
): Promise<ManagedPageSection> {
  await delay();

  const newSection: ManagedPageSection = { ...payload, id: `section-${Date.now()}` };

  writeStore([...readStore(), newSection]);

  return newSection;
}

export async function updateSection(
  id: string,
  payload: PageSectionUpsertInput,
): Promise<ManagedPageSection> {
  await delay();

  const updatedSection: ManagedPageSection = { ...payload, id };

  writeStore(readStore().map((section) => (section.id === id ? updatedSection : section)));

  return updatedSection;
}

export async function deleteSection(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((section) => section.id !== id));
}
