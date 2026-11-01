import Image from "next/image";
import { Reveal } from "@/shared/components/Reveal";
// Banner đang chạy lấy từ Backend (features/content-public); media import thẳng service
// (không qua barrel @/features/media — barrel re-export UI Admin, xem menu.service.ts).
import { listActiveBanners } from "@/features/content/public";
import { listMedia } from "@/features/media/services/public-media.service";

const FALLBACK_ALT = "Ưu đãi bánh cuốn Tây Hồ";

/**
 * Chỉ hiển thị ảnh banner: ảnh ưu đãi đã có sẵn chữ và giá, nên không đè tiêu đề/nút
 * (heading/ctaLabel của Banner không dùng ở vị trí này).
 * Không có Banner "HOME_PROMOTION" đang chạy (bị tắt, hết hạn, bị xóa, Backend không phản hồi)
 * hoặc media của nó không còn hoạt động → ẩn cả mục, để Admin tắt banner là tắt được ưu đãi.
 */
export async function PromotionZone() {
  const [banner] = await listActiveBanners("HOME_PROMOTION");
  if (!banner?.desktopMediaId) {
    return null;
  }

  const mediaList = await listMedia();
  const media = mediaList.find((item) => item.id === banner.desktopMediaId);
  if (!media) {
    return null;
  }

  const imageUrl = media.url;
  const altText = banner.altText || media.altText || FALLBACK_ALT;

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
    </section>
  );
}
