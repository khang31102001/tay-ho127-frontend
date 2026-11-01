import type { ReactNode } from "react";
import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import type { SiteBrand } from "@/features/organization/brand-profile/types/brand-profile.types";
import {
  buildGoogleMapsUrl,
  formatBrandAddress,
  getContactPhone,
  toTelHref,
} from "@/features/organization/brand-profile/utils/site-contact";

import { WEEKDAY_LABELS, getVietnamWeekdayIndex, normalizeTime } from "../utils/opening-hours";

type ContactInfoCardProps = {
  brand: SiteBrand;
};

/**
 * Thông tin liên hệ + bảng giờ mở cửa 7 ngày (tô đậm hôm nay) của chi nhánh chính — mọi giá trị do Admin nhập.
 * Thiếu dòng nào ẩn dòng đó, không bịa giá trị thay. Các nút hành động nằm ở ContactHero.
 */
export function ContactInfoCard({ brand }: ContactInfoCardProps) {
  const address = formatBrandAddress(brand);
  const phone = getContactPhone(brand);
  const telHref = toTelHref(phone);
  const email = brand.email?.trim();
  const mapsUrl = buildGoogleMapsUrl(brand);
  const opens = normalizeTime(brand.openTime);
  const closes = normalizeTime(brand.closeTime);
  const hoursNote = brand.businessHoursNote?.trim();
  const todayIndex = getVietnamWeekdayIndex();

  return (
    <div className="card-surface p-6 sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-red">Thông tin quán</p>
      <h2 className="mt-1 text-[24px] font-black leading-snug text-brand-ink">{brand.name}</h2>

      <dl className="mt-5 space-y-4 text-[15px] text-brand-ink">
        {address && (
          <InfoRow icon={<MapPin size={18} />} label="Địa chỉ">
            <p>{address}</p>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-brand-red underline-offset-4 hover:underline"
              >
                Mở trong Google Maps
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </InfoRow>
        )}
        {phone && (
          <InfoRow icon={<Phone size={18} />} label="Điện thoại">
            {telHref ? (
              <a href={telHref} className="focus-ring font-bold hover:text-brand-red">
                {phone}
              </a>
            ) : (
              phone
            )}
          </InfoRow>
        )}
        {email && (
          <InfoRow icon={<Mail size={18} />} label="Email">
            <a href={`mailto:${email}`} className="focus-ring hover:text-brand-red">
              {email}
            </a>
          </InfoRow>
        )}
        {(opens && closes) || hoursNote ? (
          <InfoRow icon={<Clock size={18} />} label="Giờ mở cửa">
            {opens && closes && (
              <table className="w-full max-w-[320px] text-sm">
                <caption className="sr-only">Giờ mở cửa theo ngày</caption>
                <tbody>
                  {WEEKDAY_LABELS.map((label, index) => {
                    const isToday = index === todayIndex;
                    return (
                      <tr key={label} className={isToday ? "font-black text-brand-red" : "text-brand-ink/80"}>
                        <th scope="row" className="py-1 pr-4 text-left font-[inherit]">
                          {label}
                          {isToday && <span className="ml-1.5 text-xs">(hôm nay)</span>}
                        </th>
                        <td className="py-1 text-right tabular-nums">
                          {opens} – {closes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {hoursNote && <p className="mt-1 text-sm text-brand-ink/70">{hoursNote}</p>}
          </InfoRow>
        ) : null}
      </dl>
    </div>
  );
}

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
};

function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="flex gap-3">
      <dt className="mt-0.5 shrink-0 text-brand-green">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}
