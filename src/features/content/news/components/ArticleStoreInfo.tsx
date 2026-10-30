import type { ReactNode } from "react";
import Link from "next/link";
import { Clock, MapPin, Navigation, Phone, UtensilsCrossed } from "lucide-react";

import type { SiteBrand } from "@/features/organization/brand-profile/types/brand-profile.types";
import {
  buildGoogleMapsUrl,
  formatBrandAddress,
  formatOpeningHours,
  getContactPhone,
  toTelHref,
} from "@/features/organization/brand-profile/utils/site-contact";

type ArticleStoreInfoProps = {
  brand: SiteBrand;
};

/**
 * Khối "Thông tin quán" cuối bài — lấy từ chi nhánh chính (Admin nhập), không hard-code.
 * Thiếu cả địa chỉ lẫn số điện thoại thì ẩn cả khối; thiếu dòng nào ẩn dòng đó.
 */
export function ArticleStoreInfo({ brand }: ArticleStoreInfoProps) {
  const address = formatBrandAddress(brand);
  const hours = formatOpeningHours(brand);
  const phone = getContactPhone(brand);
  const telHref = toTelHref(phone);
  const mapsUrl = buildGoogleMapsUrl(brand);

  if (!address && !phone) return null;

  return (
    <aside aria-labelledby="article-store-info" className="card-surface mt-12 p-6 sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-red">Ghé quán</p>
      <h2 id="article-store-info" className="mt-1 text-[22px] font-black leading-snug text-brand-ink">
        {brand.name}
      </h2>

      <dl className="mt-4 space-y-2.5 text-sm text-brand-ink">
        {address && <InfoRow icon={<MapPin size={16} />} label="Địa chỉ" value={address} />}
        {hours && <InfoRow icon={<Clock size={16} />} label="Giờ mở cửa" value={hours} />}
        {phone && <InfoRow icon={<Phone size={16} />} label="Điện thoại" value={phone} />}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        {telHref && (
          <a
            href={telHref}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Phone size={16} aria-hidden="true" />
            Gọi đặt bàn
          </a>
        )}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-5 py-2.5 text-sm font-bold text-brand-ink transition hover:border-brand-red hover:text-brand-red"
          >
            <Navigation size={16} aria-hidden="true" />
            Chỉ đường
          </a>
        )}
        <Link
          href="/thuc-don"
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-5 py-2.5 text-sm font-bold text-brand-ink transition hover:border-brand-red hover:text-brand-red"
        >
          <UtensilsCrossed size={16} aria-hidden="true" />
          Xem thực đơn
        </Link>
      </div>
    </aside>
  );
}

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex gap-2.5">
      <dt className="mt-0.5 shrink-0 text-brand-green">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
