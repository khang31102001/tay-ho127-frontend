import { adminApi } from "@/lib/http/admin-api";

import type { ManagedBrandProfile } from "../types/brand-profile.types";
import type { SocialLink, SocialPlatform } from "../types/social-link.types";

/**
 * Admin → Tổ chức → Thông tin thương hiệu, gọi Backend /api/v1/organization/brand-profile (quyền brand-profile.view|update).
 * Singleton: chỉ có get/update; Backend tự tạo bản ghi mặc định khi chưa có. Website đọc cùng dữ liệu này (kèm Chi nhánh chính)
 * qua brand-public.service.ts.
 *
 * Backend trả 400 nếu một liên kết có nền tảng không hỗ trợ hoặc URL không phải http(s). Liên kết MXH không có id ở Backend:
 * `id` chỉ là khóa hiển thị phía client, được sinh lại mỗi lần đọc.
 */

/** BrandProfileResponse của Backend (giá trị rỗng là null). */
export type BrandProfileDto = {
  name: string;
  tagline: string;
  description: string | null;
  taxCode: string | null;
  legalName: string | null;
  socialLinks: Array<{ platform: SocialPlatform; url: string; displayOrder: number; isActive: boolean }>;
  logoMediaId: string | null;
  logoDarkMediaId: string | null;
  logoLightMediaId: string | null;
  faviconMediaId: string | null;
  ogImageMediaId: string | null;
  updatedAt: string;
};

export function toManagedBrandProfile(dto: BrandProfileDto): ManagedBrandProfile {
  return {
    name: dto.name,
    tagline: dto.tagline,
    description: dto.description ?? undefined,
    taxCode: dto.taxCode ?? undefined,
    legalName: dto.legalName ?? undefined,
    socialLinks: dto.socialLinks.map((link, index): SocialLink => ({ id: `social-${index}`, ...link })),
    logoMediaId: dto.logoMediaId,
    logoDarkMediaId: dto.logoDarkMediaId,
    logoLightMediaId: dto.logoLightMediaId,
    faviconMediaId: dto.faviconMediaId,
    ogImageMediaId: dto.ogImageMediaId,
    updatedAt: dto.updatedAt,
  };
}

export async function getBrandProfile(): Promise<ManagedBrandProfile> {
  return toManagedBrandProfile(await adminApi.get<BrandProfileDto>("/organization/brand-profile"));
}

export type UpdateBrandProfileInput = Omit<ManagedBrandProfile, "updatedAt">;

export async function updateBrandProfile(input: UpdateBrandProfileInput): Promise<ManagedBrandProfile> {
  const body = {
    ...input,
    socialLinks: input.socialLinks.map(({ platform, url, displayOrder, isActive }) => ({ platform, url, displayOrder, isActive })),
  };
  return toManagedBrandProfile(await adminApi.put<BrandProfileDto>("/organization/brand-profile", body));
}
