import type { SocialLink } from "./social-link.types";

/**
 * THÔNG TIN THƯƠNG HIỆU (Brand Profile) — "danh tính" CHUNG của cả doanh nghiệp, một bản ghi duy nhất (Backend
 * /api/v1/organization/brand-profile): tên, slogan, mô tả, logo/favicon, tên pháp lý + mã số thuế, mạng xã hội. Hiển thị trên
 * website và trong kết quả tìm kiếm (SEO).
 *
 * KHÔNG chứa địa chỉ, số điện thoại, giờ mở cửa — những thứ đó khác nhau theo từng nơi nên thuộc về CHI NHÁNH
 * (features/organization, màn "Chi nhánh"). Website ghép Thông tin thương hiệu + Chi nhánh chính: xem `SiteBrand`.
 */
export type ManagedBrandProfile = {
  name: string;
  tagline: string;
  description?: string;

  taxCode?: string;
  legalName?: string;

  socialLinks: SocialLink[];

  // Tài sản nhận diện (id media — tái sử dụng Media)
  logoMediaId: string | null;
  logoDarkMediaId: string | null;
  logoLightMediaId: string | null;
  faviconMediaId: string | null;
  ogImageMediaId: string | null;

  updatedAt: string;
};

/**
 * Thương hiệu như WEBSITE dùng: danh tính chung (BrandProfile) + liên hệ/địa chỉ/giờ mở cửa của CHI NHÁNH CHÍNH. Chưa có chi
 * nhánh chính thì các trường liên hệ để trống.
 */
export type SiteBrand = ManagedBrandProfile & {
  phone: string;
  hotline?: string;
  email?: string;
  addressLine: string;
  ward?: string;
  district?: string;
  province?: string;
  openTime: string;
  closeTime: string;
  businessHoursNote?: string;
};
