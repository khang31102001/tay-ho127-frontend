import type { ManagedBrandSettings } from "../types/brand-settings.types";

/**
 * MOCK CONTRACT: seed khởi tạo từ src/data/site.ts (nguồn dữ liệu tĩnh hiện
 * tại của Header/Footer/Hero) để Admin có dữ liệu thật ngay khi mở màn Brand
 * Settings lần đầu. Đây là 2 nguồn tách biệt trong Phase này — Admin sửa ở
 * đây CHƯA ảnh hưởng site.ts (việc nối Admin → User Site thuộc Phase User
 * Site Integration sau này).
 */
export const SEED_BRAND_SETTINGS: ManagedBrandSettings = {
  id: "brand-settings",
  name: "Bánh Cuốn Tây Hồ 127",
  tagline: "Bánh cuốn truyền thống, phục vụ nhanh, hương vị gia đình Bắc giữa Sài Gòn.",
  description: "",
  phone: "0900 127 127",
  hotline: "",
  email: "",
  addressLine: "127 Đinh Tiên Hoàng",
  ward: "Đa Kao",
  district: "Quận 1",
  province: "TP. Hồ Chí Minh",
  taxCode: "",
  legalName: "",
  socialLinks: [
    { id: "social-1", platform: "website", url: "https://tayho127.com", displayOrder: 1, isActive: true },
    { id: "social-2", platform: "facebook", url: "https://www.facebook.com/tayho127", displayOrder: 2, isActive: true },
    { id: "social-3", platform: "instagram", url: "https://www.instagram.com/tayho127", displayOrder: 3, isActive: true },
    { id: "social-4", platform: "tiktok", url: "https://www.tiktok.com/@tayho127", displayOrder: 4, isActive: true },
    { id: "social-5", platform: "shopee", url: "https://shopee.vn/tayho127", displayOrder: 5, isActive: true },
  ],
  logoMediaId: null,
  logoDarkMediaId: null,
  logoLightMediaId: null,
  faviconMediaId: null,
  ogImageMediaId: null,
  openTime: "06:00",
  closeTime: "21:30",
  businessHoursNote: "Mở cửa tất cả các ngày trong tuần.",
  updatedAt: "2026-02-01T00:00:00.000Z",
};
