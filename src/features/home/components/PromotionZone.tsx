import Image from "next/image";
import { Reveal } from "@/components/shared/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
// Import thẳng service/type thay vì qua @/features/banners, @/features/media
// (barrel 2 feature này re-export cả UI Admin Explorer/Editor — import qua
// barrel sẽ kéo UI admin vào bundle Site, xem menu.service.ts để biết lý do).
import { listActiveBannersByPlacement } from "@/features/banners/services/banner.service";
import { listMedia } from "@/features/media/services/media.service";

/**
 * MOCK CONTRACT: nội dung mặc định khi chưa có Banner nào bật cho vị trí
 * "HOME_PROMOTION" (banner bị tắt, hết hạn, hoặc bị xóa) — giữ đúng nội dung
 * đã hard-code trước khi có CMS để trang chủ không bao giờ trống.
 */
const FALLBACK_IMAGE = "/images/promotion-zone-3.png";
const FALLBACK_ALT = "Ưu đãi bánh cuốn Tây Hồ";
const FALLBACK_HEADING = "Hương vị truyền thống";
const FALLBACK_CTA_LABEL = "Xem ưu đãi";
const FALLBACK_CTA_URL = "/menu";

export async function PromotionZone() {
  const [banner] = await listActiveBannersByPlacement("HOME_PROMOTION");

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
