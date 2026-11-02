/**
 * Registry loại section — thêm loại mới chỉ cần thêm 1 phần tử ở đây,
 * không phải sửa entity/service/UI khác (giống MEDIA_TYPE_OPTIONS).
 */
export const SECTION_TYPE_OPTIONS = [
  { value: "hero", label: "Hero" },
  { value: "introduction", label: "Giới thiệu" },
  { value: "promotion", label: "Khuyến mãi" },
  { value: "highlight", label: "Sản phẩm nổi bật" },
  { value: "testimonial", label: "Đánh giá khách hàng" },
  { value: "cta", label: "Kêu gọi hành động (CTA)" },
  { value: "story", label: "Câu chuyện thương hiệu" },
  { value: "award", label: "Giải thưởng / Thành tích" },
  { value: "stats", label: "Số liệu" },
  { value: "timeline", label: "Mốc thời gian" },
  { value: "faq", label: "Câu hỏi thường gặp" },
  { value: "core", label: "Nội dung chính của trang" },
] as const;

export type SectionType = (typeof SECTION_TYPE_OPTIONS)[number]["value"];

/** Loại section có danh sách dòng (`items`) — Backend chỉ nhận `items` ở các loại này. */
export const LIST_SECTION_TYPES: readonly SectionType[] = ["stats", "timeline", "faq"];

/** Loại section có ảnh phụ (`galleryMediaIds`). */
export const GALLERY_SECTION_TYPES: readonly SectionType[] = ["story", "award"];

/**
 * 1 khối nội dung thuộc về 1 Page (xem features/pages). Không tạo domain
 * "Heading" riêng — Heading chỉ là 1 field của Section, theo đúng kiến trúc
 * đã thống nhất ở Phase 01.
 */
export type ManagedPageSection = {
  id: string;
  pageId: string;
  /** Ô (slot) trên trang mà section lấp vào — xem page-templates.ts. null = section tự do, Site không hiển thị. */
  sectionKey: string | null;
  sectionType: SectionType;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  mediaId?: string | null;
  ctaLabel?: string;
  ctaUrl?: string;
  displayOrder: number;
  isVisible: boolean;
  /** Ảnh phụ theo thứ tự (Backend: settings.galleryMediaIds) — vd. 2 ảnh cột trái của "Câu chuyện thương hiệu", logo của "Giải thưởng / Thành tích". */
  galleryMediaIds: string[];
  /** Các dòng của section dạng danh sách (Backend: settings.items) — chỉ với stats / timeline / faq. */
  items: PageSectionItem[];
};

/**
 * 1 dòng của section dạng danh sách. Nghĩa từng ô tùy loại: stats (label = nhãn, title = giá trị "60+"),
 * timeline (label = năm/mốc, title, text, ảnh), faq (title = câu hỏi, text = trả lời).
 */
export type PageSectionItem = {
  label: string;
  title: string;
  text: string;
  mediaId: string | null;
  url: string;
};
