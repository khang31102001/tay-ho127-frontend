/**
 * Vị trí banner trên Site luôn là "SECTIONS": banner hiện ở các section loại Banner của trang mà admin chọn (Trang → Section) —
 * vị trí là dữ liệu, không còn danh sách vị trí cố định. Các giá trị cũ (ARTICLE_BANNER, HOME_HERO, HOME_PROMOTION, MENU_HERO)
 * chỉ còn trong dữ liệu cũ: không chọn được nữa, lưu lại banner sẽ chuyển sang SECTIONS.
 */
export type BannerPlacement = "SECTIONS" | "ARTICLE_BANNER" | "HOME_HERO" | "HOME_PROMOTION" | "MENU_HERO";

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
