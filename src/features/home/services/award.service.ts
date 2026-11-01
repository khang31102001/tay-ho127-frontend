// SERVER-ONLY — chỉ dùng trong Server Component (xem home-section.service.ts).
import type { PublicPageSection } from "@/features/content/public";

import { findHomeSection, loadMediaById, resolveImage, type HomeImage } from "./home-section.service";

/** Khối "Giải thưởng / Thành tích" (thẻ MICHELIN) trong ExperienceSection của trang chủ, đã ghép với ảnh. */
export type HomeAward = {
  /** Tiêu đề in nghiêng màu xanh — rỗng thì không hiện. */
  heading: string;
  /** Đoạn mô tả — rỗng thì không hiện. */
  description: string;
  /** Link nhỏ dưới đoạn mô tả, khi có cả nhãn lẫn link. */
  cta: { label: string; href: string } | null;
  images: {
    /** Ảnh lớn bên trái = ảnh chính của section (chỉ hiện từ sm trở lên). */
    feature: HomeImage;
    /** Logo nhỏ phía trên tiêu đề = ảnh phụ đầu tiên. */
    badge: HomeImage;
  };
};

const AWARD_SECTION_KIND = "award";

const DEFAULT_IMAGES: HomeAward["images"] = {
  feature: { src: "/images/michelin-guide.png", alt: "Michelin Guide Ho Chi Minh City" },
  badge: { src: "/images/michelin-2026.png", alt: "Michelin 2026" },
};

/**
 * Nội dung mặc định — dùng khi Backend chưa có section "award" trên trang chủ (Admin → Nội dung → Trang →
 * Trang chủ → Sections), page chưa xuất bản hoặc Backend lỗi, để trang chủ không bao giờ trống.
 */
const DEFAULT_AWARD: HomeAward = {
  heading: "Bước chân đầu tiên mang bản sắc dân tộc đến nền ẩm thực quốc tế.",
  description:
    "Tháng 6/2026 đánh dấu một cột mốc đầy tự hào khi Bánh Cuốn Tây Hồ 127 được Cẩm nang MICHELIN Việt Nam trao danh hiệu Bib Gourmand, ghi nhận hành trình bền bỉ gìn giữ và lan tỏa hương vị truyền thống Việt Nam.",
  cta: null,
  images: DEFAULT_IMAGES,
};

async function toHomeAward(section: PublicPageSection): Promise<HomeAward> {
  const [badgeId] = section.galleryMediaIds;
  const mediaById = await loadMediaById([section.mediaId, badgeId]);

  return {
    heading: section.heading ?? "",
    description: section.body?.trim() ?? "",
    cta: section.ctaLabel && section.ctaUrl ? { label: section.ctaLabel, href: section.ctaUrl } : null,
    images: {
      feature: resolveImage(section.mediaId, mediaById, DEFAULT_IMAGES.feature),
      badge: resolveImage(badgeId, mediaById, DEFAULT_IMAGES.badge),
    },
  };
}

/**
 * Thẻ giải thưởng trên trang chủ = section "award" đầu tiên (theo thứ tự) của page "/" do Admin quản lý.
 * Cache 60 giây theo public-content.service: Admin sửa → trang chủ đổi trong tối đa 60 giây.
 */
export async function getHomeAward(): Promise<HomeAward> {
  const awardSection = await findHomeSection(AWARD_SECTION_KIND);
  return awardSection ? toHomeAward(awardSection) : DEFAULT_AWARD;
}
