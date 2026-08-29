import { SEED_BRAND_SETTINGS } from "../mocks/brand-settings.mock";
import type { ManagedBrandSettings } from "../types/brand-settings.types";

const STORAGE_KEY = "tayho-admin-brand-settings";
const MOCK_DELAY_MS = 300;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readStore(): ManagedBrandSettings {
  if (typeof window === "undefined") {
    return SEED_BRAND_SETTINGS;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BRAND_SETTINGS));
    return SEED_BRAND_SETTINGS;
  }
  return JSON.parse(raw) as ManagedBrandSettings;
}

function writeStore(settings: ManagedBrandSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Singleton — chỉ có get/update, không có create/delete (đúng theo quyết
 * định "Brand Settings" thay vì "Brand List/Create" để tránh over-engineer
 * cho hệ thống chỉ phục vụ 1 thương hiệu).
 */
export async function getBrandSettings(): Promise<ManagedBrandSettings> {
  await delay();
  return readStore();
}

export type UpdateBrandSettingsInput = Omit<ManagedBrandSettings, "id" | "updatedAt">;

export async function updateBrandSettings(input: UpdateBrandSettingsInput): Promise<ManagedBrandSettings> {
  await delay();
  const current = readStore();
  const updated: ManagedBrandSettings = {
    ...current,
    ...input,
    id: current.id,
    updatedAt: new Date().toISOString(),
  };
  writeStore(updated);
  return updated;
}
