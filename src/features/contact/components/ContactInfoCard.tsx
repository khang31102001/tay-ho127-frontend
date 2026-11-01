import type { ReactNode } from "react";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone, ShoppingBag } from "lucide-react";

import type { SiteBrand } from "@/features/organization/brand-profile/types/brand-profile.types";
import {
  buildGoogleMapsUrl,
  formatBrandAddress,
  formatOpeningHours,
  getContactPhone,
  getSocialUrl,
  toTelHref,
} from "@/features/organization/brand-profile/utils/site-contact";

type ContactInfoCardProps = {
  brand: SiteBrand;
};

const PRIMARY_ACTION_CLASS =
  "focus-ring inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90";
const SECONDARY_ACTION_CLASS =
  "focus-ring inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-5 py-2.5 text-sm font-bold text-brand-ink transition hover:border-brand-red hover:text-brand-red";

/**
 * Thông tin liên hệ của chi nhánh chính — mọi giá trị do Admin nhập (Tổ chức → Chi nhánh / Thông tin thương hiệu).
 * Thiếu dòng nào ẩn dòng/nút đó, không bịa giá trị thay.
 */
export function ContactInfoCard({ brand }: ContactInfoCardProps) {
  const address = formatBrandAddress(brand);
  const hours = formatOpeningHours(brand);
  const phone = getContactPhone(brand);
  const telHref = toTelHref(phone);
  const email = brand.email?.trim();
  const mapsUrl = buildGoogleMapsUrl(brand);
  const zaloUrl = getSocialUrl(brand, "zalo");
  const shopeeUrl = getSocialUrl(brand, "shopee");

  return (
    <div className="card-surface p-6 sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-red">Ghé quán</p>
      <h2 className="mt-1 text-[24px] font-black leading-snug text-brand-ink">{brand.name}</h2>

      <dl className="mt-5 space-y-3 text-[15px] text-brand-ink">
        {address && <InfoRow icon={<MapPin size={18} />} label="Địa chỉ" value={address} />}
        {hours && <InfoRow icon={<Clock size={18} />} label="Giờ mở cửa" value={hours} />}
        {phone && <InfoRow icon={<Phone size={18} />} label="Điện thoại" value={phone} />}
        {email && <InfoRow icon={<Mail size={18} />} label="Email" value={email} />}
      </dl>

      <div className="mt-7 flex flex-wrap gap-3">
        {telHref && (
          <a href={telHref} className={PRIMARY_ACTION_CLASS}>
            <Phone size={16} aria-hidden="true" />
            Gọi đặt bàn
          </a>
        )}
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={SECONDARY_ACTION_CLASS}>
            <Navigation size={16} aria-hidden="true" />
            Chỉ đường
          </a>
        )}
        {zaloUrl && (
          <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className={SECONDARY_ACTION_CLASS}>
            <MessageCircle size={16} aria-hidden="true" />
            Nhắn Zalo
          </a>
        )}
        {shopeeUrl && (
          <a href={shopeeUrl} target="_blank" rel="noopener noreferrer" className={SECONDARY_ACTION_CLASS}>
            <ShoppingBag size={16} aria-hidden="true" />
            Đặt trên ShopeeFood
          </a>
        )}
      </div>
    </div>
  );
}

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex gap-3">
      <dt className="mt-0.5 shrink-0 text-brand-green">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
