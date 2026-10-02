import { SEED_SEO_SETTINGS } from "../mocks/seo-settings.mock";
import type { ManagedSeoSettings, SeoSettingsFormValue } from "../types/seo-settings.types";

const STORAGE_KEY = "tayho-admin-seo-settings";
const MOCK_DELAY_MS = 300;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readStore(): ManagedSeoSettings {
  if (typeof window === "undefined") {
    return SEED_SEO_SETTINGS;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SEO_SETTINGS));
    return SEED_SEO_SETTINGS;
  }

  // Merge với SEED để backward-compatible khi thêm field mới sau này (vd.
  // robotsDisallowPaths) — bản ghi cũ đã lưu trong localStorage từ trước khi
  // có field đó sẽ không tự có, tránh undefined.join() vỡ trang.
  const parsed = JSON.parse(raw) as Partial<ManagedSeoSettings>;
  return { ...SEED_SEO_SETTINGS, ...parsed };
}

function writeStore(settings: ManagedSeoSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Singleton — chỉ có get/update, không có create/delete (giống brand-settings.service.ts).
 */
export async function getSeoSettings(): Promise<ManagedSeoSettings> {
  await delay();
  return readStore();
}

export async function updateSeoSettings(input: SeoSettingsFormValue): Promise<ManagedSeoSettings> {
  await delay();
  const current = readStore();
  const updated: ManagedSeoSettings = {
    ...current,
    ...input,
    id: current.id,
    updatedAt: new Date().toISOString(),
  };
  writeStore(updated);
  return updated;
}
