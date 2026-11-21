import { listMedia } from "@/features/media/services/public-media.service";

import type { PublicPageSection } from "../types/public-content.types";
import { BannerCarousel, type BannerSlide } from "./BannerCarousel";

type BannerSectionProps = {
  section: PublicPageSection;
  /** Hiện chữ (heading/subheading/CTA) của banner đè lên ảnh. Tắt cho ảnh ưu đãi đã có sẵn chữ. */
  showText?: boolean;
  size?: "screen" | "banner";
};

/**
 * Section loại "banner" của một trang: hiển thị các banner đang chạy gắn vào section (một ảnh, hoặc băng chuyền khi
 * nhiều banner). Dùng chung cho MỌI trang — Admin thêm section banner vào trang nào là hiện ở trang đó, không cần code
 * riêng. Không có banner đang chạy (tắt, hết hạn, media không còn hoạt động) thì ẩn cả khối.
 * Server Component: ảnh tra từ media công khai (import thẳng service, không qua barrel features/media).
 */
export async function BannerSection({ section, showText = true, size = "banner" }: BannerSectionProps) {
  if (section.banners.length === 0) {
    return null;
  }

  const mediaById = new Map((await listMedia()).map((media) => [media.id, media]));

  const slides = section.banners.flatMap<BannerSlide>((banner) => {
    const desktop = banner.desktopMediaId ? mediaById.get(banner.desktopMediaId) : undefined;
    const mobile = banner.mobileMediaId ? mediaById.get(banner.mobileMediaId) : undefined;
    const main = desktop ?? mobile;
    if (!main) {
      return [];
    }

    return [
      {
        id: banner.id,
        desktopSrc: main.url,
        mobileSrc: desktop && mobile ? mobile.url : null,
        alt: banner.altText || main.altText || banner.name,
        heading: banner.heading,
        subheading: banner.subheading,
        cta: banner.ctaLabel && banner.ctaUrl ? { label: banner.ctaLabel, href: banner.ctaUrl } : null,
      },
    ];
  });

  return slides.length > 0 ? <BannerCarousel slides={slides} showText={showText} size={size} /> : null;
}
