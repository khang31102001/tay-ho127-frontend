// SERVER-ONLY — chỉ dùng trong Server Component (xem home-section.service.ts).
import type { PublicPageSection } from "@/features/content/public";

import { loadMediaById, resolveImage, toCta, type HomeImage } from "./home-section.service";

/** Khối "Giải thưởng / Thành tích" (thẻ MICHELIN) trong ExperienceSection của trang chủ, đã ghép với ảnh. */
export type HomeAward = {
  /** Tiêu đề in nghiêng màu xanh (bắt buộc). */
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

/** Ảnh của vị trí khi section chưa chọn ảnh / ảnh không còn dùng được. */
const DEFAULT_IMAGES: HomeAward["images"] = {
  feature: { src: "/images/michelin-guide.png", alt: "Michelin Guide Ho Chi Minh City" },
  badge: { src: "/images/michelin-2026.png", alt: "Michelin 2026" },
};

/**
 * Ô "award" của trang chủ (thẻ MICHELIN trong ExperienceSection). null khi thiếu tiêu đề — trường bắt buộc — thì
 * trang chủ không hiển thị thẻ này.
 */
export async function toHomeAward(section: PublicPageSection): Promise<HomeAward | null> {
  if (!section.heading) {
    return null;
  }

  const [badgeId] = section.galleryMediaIds;
  const mediaById = await loadMediaById([section.mediaId, badgeId]);

  return {
    heading: section.heading,
    description: section.body?.trim() ?? "",
    cta: toCta(section),
    images: {
      feature: resolveImage(section.mediaId, mediaById, DEFAULT_IMAGES.feature),
      badge: resolveImage(badgeId, mediaById, DEFAULT_IMAGES.badge),
    },
  };
}
