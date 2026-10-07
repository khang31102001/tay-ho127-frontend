import { fetchBackend } from "@/lib/http/backend-fetch";

import type { SiteBrand } from "../types/brand-profile.types";
import { type BrandProfileDto, toManagedBrandProfile } from "./brand-profile.service";

/**
 * SERVER-ONLY — thương hiệu cho WEBSITE (JSON-LD/SEO...): danh tính chung + liên hệ của CHI NHÁNH CHÍNH, từ Backend
 * GET /api/v1/organization/public/brand (không cần đăng nhập, cache 60 giây). Backend lỗi hoặc chưa có dữ liệu thì dùng giá trị
 * mặc định bên dưới để Site không vỡ.
 */
const REVALIDATE_SECONDS = 60;

/** PublicBrandResponse của Backend. */
type PublicBrandDto = {
  profile: BrandProfileDto;
  primaryBranch: {
    code: string;
    name: string;
    contact: {
      phone: string | null;
      hotline: string | null;
      email: string | null;
      addressLine: string | null;
      ward: string | null;
      district: string | null;
      province: string | null;
      openTime: string | null;
      closeTime: string | null;
      businessHoursNote: string | null;
    };
  } | null;
};

const FALLBACK_BRAND: SiteBrand = {
  name: "Bánh Cuốn Tây Hồ 127",
  tagline: "Bánh cuốn truyền thống, phục vụ nhanh, hương vị gia đình Bắc giữa Sài Gòn.",
  socialLinks: [],
  logoMediaId: null,
  logoDarkMediaId: null,
  logoLightMediaId: null,
  faviconMediaId: null,
  ogImageMediaId: null,
  updatedAt: "",
  phone: "",
  addressLine: "",
  openTime: "",
  closeTime: "",
};

export async function getSiteBrand(): Promise<SiteBrand> {
  try {
    const response = await fetchBackend("/organization/public/brand", { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) {
      throw new Error(`Public brand: HTTP ${response.status}`);
    }

    const { profile, primaryBranch } = (await response.json()) as PublicBrandDto;
    const contact = primaryBranch?.contact;

    return {
      ...toManagedBrandProfile(profile),
      phone: contact?.phone ?? "",
      hotline: contact?.hotline ?? undefined,
      email: contact?.email ?? undefined,
      addressLine: contact?.addressLine ?? "",
      ward: contact?.ward ?? undefined,
      district: contact?.district ?? undefined,
      province: contact?.province ?? undefined,
      openTime: contact?.openTime ?? "",
      closeTime: contact?.closeTime ?? "",
      businessHoursNote: contact?.businessHoursNote ?? undefined,
    };
  } catch (error) {
    console.error("Không tải được thương hiệu từ Backend — dùng giá trị mặc định:", error);
    return FALLBACK_BRAND;
  }
}
