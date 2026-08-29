/**
 * Registry vị trí hiển thị Banner trên Site — thêm vị trí mới chỉ cần thêm
 * 1 phần tử ở đây (giống SECTION_TYPE_OPTIONS của PageSection). Banner không
 * FK tới Page: Site tự query theo placement, tách rời khỏi 1 record Page cụ thể.
 */
export const BANNER_PLACEMENT_OPTIONS = [
  { value: "HOME_HERO", label: "Trang chủ — Hero" },
  { value: "HOME_PROMOTION", label: "Trang chủ — Khuyến mãi" },
  { value: "MENU_HERO", label: "Thực đơn — Hero" },
  { value: "ARTICLE_BANNER", label: "Banner bài viết" },
] as const;

export type BannerPlacement = (typeof BANNER_PLACEMENT_OPTIONS)[number]["value"];

export type ManagedBanner = {
  id: string;
  name: string;
  /** Tham chiếu ManagedMedia.id, chọn từ Media Library. */
  desktopMediaId: string | null;
  mobileMediaId: string | null;
  altText: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  placement: BannerPlacement;
  /** ISO date string, để trống = không giới hạn thời gian bắt đầu/kết thúc. */
  startAt: string | null;
  endAt: string | null;
  displayOrder: number;
  isActive: boolean;
};
