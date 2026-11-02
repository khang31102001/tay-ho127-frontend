// SERVER-ONLY — chỉ dùng trong Server Component (xem home-section.service.ts).
import type { PublicPageSection } from "@/features/content/public";

import { splitParagraphs } from "@/features/content/public";

import { loadMediaById, resolveImage, toCta, type HomeImage } from "./home-section.service";

/** Khối "Câu chuyện thương hiệu" của trang chủ, đã ghép với ảnh. */
export type HomeStory = {
  /** Phần tiêu đề màu đỏ. */
  heading: string;
  /** Phần tiêu đề màu xanh nối tiếp — rỗng thì không hiện. */
  subheading: string;
  paragraphs: string[];
  /** Hiện nút khi có cả nhãn lẫn link. */
  cta: { label: string; href: string } | null;
  images: {
    /** Ảnh trên cột trái. */
    top: HomeImage;
    /** Ảnh dưới cột trái (chỉ hiện từ sm trở lên). */
    bottom: HomeImage;
    /** Ảnh dọc bên phải = ảnh chính của section. */
    side: HomeImage;
  };
};

/** Ảnh của vị trí khi section chưa chọn ảnh / ảnh không còn dùng được. */
const DEFAULT_IMAGES: HomeStory["images"] = {
  top: { src: "/images/banh-cuon-dish.jpg", alt: "Bánh cuốn Tây Hồ" },
  bottom: { src: "/images/banh-cuon-dish.jpg", alt: "Món ăn truyền thống của Tây Hồ" },
  side: { src: "/images/story-col-1.png", alt: "Câu chuyện Bánh Cuốn Tây Hồ" },
};

/**
 * Ô "story" của trang chủ (section "Câu chuyện thương hiệu"). null khi thiếu tiêu đề — trường bắt buộc — thì trang chủ
 * không hiển thị khối này.
 */
export async function toHomeStory(section: PublicPageSection): Promise<HomeStory | null> {
  if (!section.heading) {
    return null;
  }

  const [topId, bottomId] = section.galleryMediaIds;
  const mediaById = await loadMediaById([section.mediaId, topId, bottomId]);

  return {
    heading: section.heading,
    subheading: section.subheading ?? "",
    paragraphs: splitParagraphs(section.body),
    cta: toCta(section),
    images: {
      top: resolveImage(topId, mediaById, DEFAULT_IMAGES.top),
      bottom: resolveImage(bottomId, mediaById, DEFAULT_IMAGES.bottom),
      side: resolveImage(section.mediaId, mediaById, DEFAULT_IMAGES.side),
    },
  };
}
