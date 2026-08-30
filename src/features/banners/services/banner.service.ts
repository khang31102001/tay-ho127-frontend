import type { BannerPlacement, ManagedBanner } from "../types/banner.types";
import { SEED_BANNERS } from "../mocks/banner.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý Banner thật. Dữ liệu seed (xem
 * ../mocks/banner.mock.ts) + đồng bộ 2 chiều với localStorage. Khi có backend
 * thật, chỉ cần thay nội dung các hàm dưới đây — Site chỉ phụ thuộc
 * `listActiveBannersByPlacement()`, không đụng vào cách lưu trữ.
 */
const STORAGE_KEY = "tayho-admin-banners";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedBanner[] {
  if (typeof window === "undefined") {
    return SEED_BANNERS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedBanner[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu Banner admin:", error);
  }

  return SEED_BANNERS;
}

function writeStore(banners: ManagedBanner[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  } catch (error) {
    console.error("Không thể lưu dữ liệu Banner admin:", error);
  }
}

export async function listBanners(): Promise<ManagedBanner[]> {
  await delay();
  return readStore();
}

export async function getBannerById(id: string): Promise<ManagedBanner | null> {
  await delay();
  return readStore().find((banner) => banner.id === id) ?? null;
}

/**
 * Banner "đang chạy" cho 1 vị trí — Site (User Site) chỉ nên gọi hàm này,
 * không đọc thẳng localStorage/service khác. Lọc theo isActive + trong
 * khoảng startAt/endAt (nếu có), sắp theo displayOrder.
 */
export async function listActiveBannersByPlacement(
  placement: BannerPlacement,
): Promise<ManagedBanner[]> {
  await delay();

  const now = new Date().toISOString();

  return readStore()
    .filter((banner) => {
      if (banner.placement !== placement || !banner.isActive) {
        return false;
      }

      if (banner.startAt && banner.startAt > now) {
        return false;
      }

      if (banner.endAt && banner.endAt < now) {
        return false;
      }

      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export type BannerUpsertInput = Omit<ManagedBanner, "id">;

export async function createBanner(payload: BannerUpsertInput): Promise<ManagedBanner> {
  await delay();

  const newBanner: ManagedBanner = { ...payload, id: `banner-${Date.now()}` };

  writeStore([...readStore(), newBanner]);

  return newBanner;
}

export async function updateBanner(
  id: string,
  payload: BannerUpsertInput,
): Promise<ManagedBanner> {
  await delay();

  const updatedBanner: ManagedBanner = { ...payload, id };

  writeStore(readStore().map((banner) => (banner.id === id ? updatedBanner : banner)));

  return updatedBanner;
}

export async function deleteBanner(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((banner) => banner.id !== id));
}
