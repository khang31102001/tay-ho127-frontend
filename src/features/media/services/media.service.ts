import type { ManagedMedia } from "../types/media.types";
import { SEED_MEDIA } from "../mocks/media.mock";

/**
 * MOCK CONTRACT: chưa có backend/CDN upload thật. Dữ liệu seed (xem
 * ../mocks/media.mock.ts) + đồng bộ 2 chiều với localStorage.
 */
const STORAGE_KEY = "tayho-admin-media";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedMedia[] {
  if (typeof window === "undefined") {
    return SEED_MEDIA;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedMedia[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu media admin:", error);
  }

  return SEED_MEDIA;
}

function writeStore(mediaItems: ManagedMedia[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaItems));
  } catch (error) {
    console.error("Không thể lưu dữ liệu media admin:", error);
  }
}

export async function listMedia(): Promise<ManagedMedia[]> {
  await delay();
  return readStore();
}

export async function getMediaById(id: string): Promise<ManagedMedia | null> {
  await delay();
  return readStore().find((media) => media.id === id) ?? null;
}

export async function createMedia(payload: Omit<ManagedMedia, "id">): Promise<ManagedMedia> {
  await delay();

  const newMedia: ManagedMedia = { ...payload, id: `media-${Date.now()}` };

  writeStore([...readStore(), newMedia]);

  return newMedia;
}

export async function updateMedia(
  id: string,
  payload: Omit<ManagedMedia, "id">,
): Promise<ManagedMedia> {
  await delay();

  const updatedMedia: ManagedMedia = { ...payload, id };

  writeStore(readStore().map((media) => (media.id === id ? updatedMedia : media)));

  return updatedMedia;
}

export async function deleteMedia(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((media) => media.id !== id));
}
