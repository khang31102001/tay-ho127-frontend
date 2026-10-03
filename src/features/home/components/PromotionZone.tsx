import Image from "next/image";
import { Reveal } from "@/components/shared/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
// Banner đang chạy lấy từ Backend (features/content-public); media import thẳng service
// (không qua barrel @/features/media — barrel re-export UI Admin, xem menu.service.ts).
import { listActiveBanners } from "@/features/content-public";
import { listMedia } from "@/features/media/services/public-media.service";

/**
 * Nội dung mặc định khi chưa có Banner nào đang chạy cho vị trí "HOME_PROMOTION"
 * (banner bị tắt, hết hạn, bị xóa, hoặc Backend không phản hồi) — để trang chủ không bao giờ trống.
 */
const FALLBACK_IMAGE = "/images/promotion-zone-3.png";
const FALLBACK_ALT = "Ưu đãi bánh cuốn Tây Hồ";
const FALLBACK_HEADING = "Hương vị truyền thống";
const FALLBACK_CTA_LABEL = "Xem ưu đãi";
const FALLBACK_CTA_URL = "/menu";

export async function PromotionZone() {
  const [banner] = await listActiveBanners("HOME_PROMOTION");

  let imageUrl = FALLBACK_IMAGE;
  let altText = FALLBACK_ALT;

  if (banner?.desktopMediaId) {
    const mediaList = await listMedia();
    const media = mediaList.find((item) => item.id === banner.desktopMediaId);

    if (media) {
      imageUrl = media.url;
      altText = banner.altText || media.altText || FALLBACK_ALT;
    }
  }

  const heading = banner?.heading || FALLBACK_HEADING;
  const ctaLabel = banner?.ctaLabel || FALLBACK_CTA_LABEL;
  const ctaUrl = banner?.ctaUrl || FALLBACK_CTA_URL;

  return (
    <section className="relative min-h-svh overflow-hidden">
      <Reveal type="zoom-in" className="absolute inset-0" duration={1}>
        <Image
          src={imageUrl}
          alt={altText}
          width={1200}
          height={800}
          className="size-full object-cover"
        />
      </Reveal>

      <div className="relative z-10 flex min-h-svh items-center justify-center">
        <div className="text-center">
          <Reveal type="fade-up" delay={0.15}>
            <h2 className="text-brand-green text-5xl font-bold">{heading}</h2>
          </Reveal>

          <Reveal type="fade-up" delay={0.3}>
            <ButtonLink href={ctaUrl} className="mt-8">
              {ctaLabel}
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
