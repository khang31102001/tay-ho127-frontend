import type { ManagedPageSection } from "../types/page-section.types";

/**
 * MOCK CONTRACT: seed Section cho "Trang chủ" (page-home), mô phỏng lại các
 * section đang hard-code trong src/features/home/components/* để Admin có
 * dữ liệu thật sự chỉnh — chưa nối vào Site render ở Phase này (xem Phase 07).
 */
export const SEED_PAGE_SECTIONS: ManagedPageSection[] = [
  {
    id: "section-home-hero",
    pageId: "page-home",
    sectionType: "hero",
    eyebrow: "Bánh cuốn",
    heading: "TÂY HỒ",
    subheading: "Từ bàn tay khéo léo, mỗi phần bánh là một câu chuyện Việt.",
    mediaId: "media-hero-platter",
    ctaLabel: "Đặt ngay",
    ctaUrl: "/menu",
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: "section-home-story",
    pageId: "page-home",
    sectionType: "introduction",
    heading: "Hương vị gia đình Bắc giữa Sài Gòn",
    body: "Bánh Cuốn Tây Hồ 127 giữ nguyên công thức truyền thống, tráng bánh thủ công mỗi ngày để mang đến hương vị chuẩn vị Bắc cho thực khách Sài Gòn.",
    mediaId: "media-hero-cooking",
    displayOrder: 2,
    isVisible: true,
  },
  {
    id: "section-home-promotion",
    pageId: "page-home",
    sectionType: "promotion",
    heading: "Ưu đãi tuần này",
    body: "Giảm 10% cho hoá đơn từ 200.000đ khi đặt qua website.",
    ctaLabel: "Xem thực đơn",
    ctaUrl: "/thuc-don",
    displayOrder: 3,
    isVisible: true,
  },
  {
    id: "section-home-favorites",
    pageId: "page-home",
    sectionType: "highlight",
    heading: "Những lựa chọn được yêu thích nhất",
    ctaLabel: "Xem thực đơn",
    ctaUrl: "/menu",
    displayOrder: 4,
    isVisible: true,
  },
  {
    id: "section-home-experience",
    pageId: "page-home",
    sectionType: "introduction",
    heading: "Trải nghiệm tại Tây Hồ 127",
    body: "Không gian ấm cúng, phục vụ nhanh, phù hợp cho bữa sáng lẫn buổi họp mặt gia đình.",
    mediaId: "media-banh-cuon-dish",
    displayOrder: 5,
    isVisible: true,
  },
  {
    id: "section-home-testimonials",
    pageId: "page-home",
    sectionType: "testimonial",
    heading: "Khách hàng nói gì về chúng tôi",
    mediaId: "media-review-card",
    displayOrder: 6,
    isVisible: true,
  },
];
