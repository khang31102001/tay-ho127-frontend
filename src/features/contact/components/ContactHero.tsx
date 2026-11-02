import { MessageCircle, Navigation, Phone, ShoppingBag } from "lucide-react";

import type { SiteBrand } from "@/features/organization/brand-profile/types/brand-profile.types";
import {
  buildGoogleMapsUrl,
  formatBrandAddress,
  getContactPhone,
  getSocialUrl,
  toTelHref,
} from "@/features/organization/brand-profile/utils/site-contact";
import { Container } from "@/shared/ui/Container";

import { getOpenStatus } from "../utils/opening-hours";

type ContactHeroProps = {
  brand: SiteBrand;
  /** Nhãn nhỏ phía trên tên quán (eyebrow của ô "hero" trang Liên hệ) — rỗng thì không hiện. */
  badge: string;
};

const PRIMARY_ACTION_CLASS =
  "focus-ring inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-3 text-sm font-bold text-white transition hover:opacity-90";
const SECONDARY_ACTION_CLASS =
  "focus-ring inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20";

/**
 * Màn hình đầu trang Liên hệ: tên quán + địa chỉ (H1 chứa địa điểm — khách và Google tìm theo địa chỉ), trạng thái
 * mở cửa và các nút hành động, để không phải cuộn mới gọi/chỉ đường được. Mọi giá trị từ chi nhánh chính (Admin).
 */
export function ContactHero({ brand, badge }: ContactHeroProps) {
  const address = formatBrandAddress(brand);
  const phone = getContactPhone(brand);
  const telHref = toTelHref(phone);
  const mapsUrl = buildGoogleMapsUrl(brand);
  const shopeeUrl = getSocialUrl(brand, "shopee");
  const zaloUrl = getSocialUrl(brand, "zalo");
  const openStatus = getOpenStatus(brand.openTime, brand.closeTime);

  return (
    <section className="overflow-hidden bg-brand-ink bg-hero text-white">
      <Container className="flex flex-col items-center gap-4 py-14 text-center sm:py-16 md:py-20">
        {badge && (
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm sm:text-[11px]">
            {badge}
          </span>
        )}

        <h1 className="heading-xl text-[30px] sm:text-[40px] md:text-[48px]">
          {brand.name}
          {address && (
            <span className="mt-3 block font-sans text-[15px] font-semibold normal-case leading-7 tracking-normal text-white/80 sm:text-[17px]">
              {address}
            </span>
          )}
        </h1>

        {openStatus && (
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${openStatus.isOpen ? "bg-emerald-400" : "bg-white/40"}`}
            />
            <span className={openStatus.isOpen ? "text-emerald-300" : "text-white/80"}>
              {openStatus.isOpen ? "Đang mở cửa" : "Đã đóng cửa"}
            </span>
            <span className="text-white/60">· {openStatus.detail}</span>
          </p>
        )}

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {telHref && (
            <a href={telHref} className={PRIMARY_ACTION_CLASS}>
              <Phone size={16} aria-hidden="true" />
              Gọi {phone}
            </a>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={SECONDARY_ACTION_CLASS}>
              <Navigation size={16} aria-hidden="true" />
              Chỉ đường
            </a>
          )}
          {shopeeUrl && (
            <a href={shopeeUrl} target="_blank" rel="noopener noreferrer" className={SECONDARY_ACTION_CLASS}>
              <ShoppingBag size={16} aria-hidden="true" />
              Đặt trên ShopeeFood
            </a>
          )}
          {zaloUrl && (
            <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className={SECONDARY_ACTION_CLASS}>
              <MessageCircle size={16} aria-hidden="true" />
              Nhắn Zalo
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}
