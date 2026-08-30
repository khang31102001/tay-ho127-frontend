import type { SocialLink } from "./social-link.types";

/**
 * Single-brand "Brand Settings" (không phải Brand List/Create) — hệ thống
 * chỉ phục vụ 1 thương hiệu, không cần entity Brand độc lập nhiều bản ghi.
 * businessHours dùng 1 khung giờ chung (openTime/closeTime) thay vì mảng
 * theo từng ngày — khớp dữ liệu hiện tại (site.ts chỉ có 1 chuỗi giờ mở cửa
 * áp dụng mọi ngày), tránh over-engineer khi business chưa cần lịch riêng
 * theo thứ.
 */
export type ManagedBrandSettings = {
  id: string;

  // General
  name: string;
  tagline: string;
  description?: string;

  // Contact
  phone: string;
  hotline?: string;
  email?: string;

  // Address
  addressLine: string;
  ward?: string;
  district?: string;
  province?: string;

  // Business Info
  taxCode?: string;
  legalName?: string;

  // Social
  socialLinks: SocialLink[];

  // Branding Assets (reuse Media)
  logoMediaId: string | null;
  logoDarkMediaId: string | null;
  logoLightMediaId: string | null;
  faviconMediaId: string | null;
  ogImageMediaId: string | null;

  // Business Hours
  openTime: string;
  closeTime: string;
  businessHoursNote?: string;

  updatedAt: string;
};
