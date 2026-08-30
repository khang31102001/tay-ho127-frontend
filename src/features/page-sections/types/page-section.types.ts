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
] as const;

export type SectionType = (typeof SECTION_TYPE_OPTIONS)[number]["value"];

/**
 * 1 khối nội dung thuộc về 1 Page (xem features/pages). Không tạo domain
 * "Heading" riêng — Heading chỉ là 1 field của Section, theo đúng kiến trúc
 * đã thống nhất ở Phase 01.
 */
export type ManagedPageSection = {
  id: string;
  pageId: string;
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
};
