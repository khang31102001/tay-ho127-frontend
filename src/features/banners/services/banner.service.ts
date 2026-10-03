import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { BannerPlacement, ManagedBanner } from "../types/banner.types";

/**
 * Admin → Content → Banner, gọi Backend /api/v1/content/banners (quyền banners.*).
 * Site đọc banner ĐANG CHẠY (bật + trong khoảng startAt/endAt) qua
 * features/content-public, không qua file này.
 *
 * - `ctaUrl` chỉ nhận đường dẫn trong site ("/thuc-don") hoặc URL http(s) — Backend trả 400 với scheme khác.
 * - `startAt`/`endAt` là mốc UTC (null = không giới hạn); `endAt` phải sau `startAt`.
 */

/** BannerResponse của Backend. */
type BannerDto = {
  id: string;
  name: string;
  desktopMediaId: string | null;
  mobileMediaId: string | null;
  altText: string;
  heading: string | null;
  subheading: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  placement: BannerPlacement;
  startAt: string | null;
  endAt: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type BannerUpsertInput = Omit<ManagedBanner, "id">;

function toManagedBanner(dto: BannerDto): ManagedBanner {
  return {
    id: dto.id,
    name: dto.name,
    desktopMediaId: dto.desktopMediaId,
    mobileMediaId: dto.mobileMediaId,
    altText: dto.altText,
    heading: dto.heading ?? undefined,
    subheading: dto.subheading ?? undefined,
    ctaLabel: dto.ctaLabel ?? undefined,
    ctaUrl: dto.ctaUrl ?? undefined,
    placement: dto.placement,
    startAt: dto.startAt,
    endAt: dto.endAt,
    displayOrder: dto.displayOrder,
    isActive: dto.isActive,
  };
}

function toRequest(payload: BannerUpsertInput) {
  return {
    name: payload.name,
    desktopMediaId: payload.desktopMediaId,
    mobileMediaId: payload.mobileMediaId,
    altText: payload.altText,
    heading: payload.heading ?? null,
    subheading: payload.subheading ?? null,
    ctaLabel: payload.ctaLabel ?? null,
    ctaUrl: payload.ctaUrl ?? null,
    placement: payload.placement,
    startAt: payload.startAt,
    endAt: payload.endAt,
    displayOrder: payload.displayOrder,
    isActive: payload.isActive,
  };
}

export async function listBanners(): Promise<ManagedBanner[]> {
  const page = await adminApi.get<PaginatedResult<BannerDto>>("/content/banners", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedBanner);
}

export async function getBannerById(id: string): Promise<ManagedBanner> {
  return toManagedBanner(await adminApi.get<BannerDto>(`/content/banners/${id}`));
}

export async function createBanner(payload: BannerUpsertInput): Promise<ManagedBanner> {
  return toManagedBanner(await adminApi.post<BannerDto>("/content/banners", toRequest(payload)));
}

export async function updateBanner(id: string, payload: BannerUpsertInput): Promise<ManagedBanner> {
  return toManagedBanner(await adminApi.put<BannerDto>(`/content/banners/${id}`, toRequest(payload)));
}

export function deleteBanner(id: string): Promise<void> {
  return adminApi.delete<void>(`/content/banners/${id}`);
}
