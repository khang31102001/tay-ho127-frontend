import type { SiteBrand } from "../types/brand-profile.types";
import type { SocialLink, SocialPlatform } from "../types/social-link.types";

/**
 * Chuyển SiteBrand (Backend: Thông tin thương hiệu + chi nhánh chính) thành các chuỗi hiển thị trên Website. Chỉ là hàm thuần,
 * KHÔNG chứa dữ liệu — mọi giá trị thật (địa chỉ, SĐT, giờ, link MXH) do Admin nhập; thiếu thì trả chuỗi rỗng/undefined để
 * nơi hiển thị tự ẩn, không bịa dữ liệu thay.
 */

/** "127 Đinh Tiên Hoàng, Đa Kao, Quận 1, TP. Hồ Chí Minh" — bỏ phần nào chưa nhập. */
export function formatBrandAddress(brand: Pick<SiteBrand, "addressLine" | "ward" | "district" | "province">): string {
  return [brand.addressLine, brand.ward, brand.district, brand.province]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

/** Giờ mở cửa: ghi chú tự do của chi nhánh nếu có, không thì "06:00 - 21:30". Rỗng khi chưa nhập giờ. */
export function formatOpeningHours(brand: Pick<SiteBrand, "openTime" | "closeTime" | "businessHoursNote">): string {
  const note = brand.businessHoursNote?.trim();
  if (note) return note;
  if (brand.openTime && brand.closeTime) return `${brand.openTime} - ${brand.closeTime}`;
  return "";
}

/** Số để khách gọi đặt bàn: hotline nếu có, không thì số cửa hàng. */
export function getContactPhone(brand: Pick<SiteBrand, "phone" | "hotline">): string {
  return brand.hotline?.trim() || brand.phone?.trim() || "";
}

/** "tel:" an toàn: chỉ giữ chữ số và dấu +. Trả undefined khi không có số. */
export function toTelHref(phone: string): string | undefined {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : undefined;
}

/** Link Google Maps tìm theo địa chỉ chi nhánh chính. Undefined khi chưa có địa chỉ. */
export function buildGoogleMapsUrl(brand: Pick<SiteBrand, "addressLine" | "ward" | "district" | "province">): string | undefined {
  const address = formatBrandAddress(brand);
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : undefined;
}

/** Link MXH đang bật theo thứ tự hiển thị, bỏ link rỗng. */
export function getActiveSocialLinks(brand: Pick<SiteBrand, "socialLinks">): SocialLink[] {
  return [...brand.socialLinks]
    .filter((link) => link.isActive && link.url.trim())
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getSocialUrl(brand: Pick<SiteBrand, "socialLinks">, platform: SocialPlatform): string | undefined {
  return getActiveSocialLinks(brand).find((link) => link.platform === platform)?.url;
}
