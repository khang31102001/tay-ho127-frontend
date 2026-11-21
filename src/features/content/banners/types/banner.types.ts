/**
 * Cách hiển thị banner trên Site. Mặc định "SECTIONS": banner hiện ở các section loại Banner của trang mà admin chọn
 * (Trang → Section) — vị trí là dữ liệu, thêm section banner vào trang nào là banner hiện ở trang đó, không cần code.
 * "ARTICLE_BANNER" còn lại cho trang chi tiết bài viết (template, chưa có section). Các vị trí cũ (HOME_HERO,
 * HOME_PROMOTION, MENU_HERO) đã được chuyển sang "SECTIONS" và không còn chọn được.
 */
export const BANNER_PLACEMENT_OPTIONS = [
  { value: "SECTIONS", label: "Theo section của trang" },
  { value: "ARTICLE_BANNER", label: "Banner bài viết" },
] as const;

/** Giá trị Backend có thể trả về, kể cả vị trí cũ chưa còn chọn được. */
export type BannerPlacement = (typeof BANNER_PLACEMENT_OPTIONS)[number]["value"] | "HOME_HERO" | "HOME_PROMOTION" | "MENU_HERO";

/** Một section banner mà banner đang hiển thị: trang chứa nó + nhãn dễ đọc của section. */
export type BannerSectionRef = {
  sectionId: string;
  pageId: string;
  pageName: string;
  sectionLabel: string;
};

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
  /** Các section banner banner này hiển thị (chỉ có khi đọc từ Backend). */
  sections: BannerSectionRef[];
};
