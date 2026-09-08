import type { ManagedBanner } from "../types/banner.types";

/**
 * MOCK CONTRACT: seed tối thiểu cho Phase 03 (Banner Management). Banner
 * "home-promotion" khớp đúng nội dung đang hard-code ở
 * src/features/home/components/PromotionZone.tsx — Site đọc banner này qua
 * placement "HOME_PROMOTION" (xem PromotionZone.tsx) để kiểm chứng end-to-end,
 * không đổi giao diện đang hiển thị cho khách.
 */
export const SEED_BANNERS: ManagedBanner[] = [
  {
    id: "banner-home-promotion",
    name: "Khuyến mãi trang chủ",
    desktopMediaId: "media-promotion-zone-3",
    mobileMediaId: "media-promotion-zone-2",
    altText: "Ưu đãi bánh cuốn Tây Hồ",
    heading: "Hương vị truyền thống",
    ctaLabel: "Xem ưu đãi",
    ctaUrl: "/menu",
    placement: "HOME_PROMOTION",
    startAt: null,
    endAt: null,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "banner-menu-hero-tet",
    name: "Ưu đãi Tết (nháp)",
    desktopMediaId: null,
    mobileMediaId: null,
    altText: "Ưu đãi Tết Nguyên Đán",
    heading: "Ưu đãi Tết Nguyên Đán",
    subheading: "Giảm 15% toàn thực đơn",
    ctaLabel: "Xem thực đơn",
    ctaUrl: "/thuc-don",
    placement: "MENU_HERO",
    startAt: "2026-02-01T00:00:00.000Z",
    endAt: "2026-02-20T00:00:00.000Z",
    displayOrder: 1,
    isActive: false,
  },
];
