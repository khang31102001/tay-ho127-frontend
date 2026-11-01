import type { SiteBrand } from "@/features/organization/brand-profile/types/brand-profile.types";
import { formatBrandAddress } from "@/features/organization/brand-profile/utils/site-contact";

type ContactMapProps = {
  brand: SiteBrand;
};

/**
 * Bản đồ nhúng Google Maps theo tên quán + địa chỉ chi nhánh chính (Admin nhập). Dạng nhúng không cần API key.
 * Có tên quán trong truy vấn để Maps ghim đúng hồ sơ doanh nghiệp (kèm đánh giá) thay vì chỉ một số nhà.
 */
export function ContactMap({ brand }: ContactMapProps) {
  const address = formatBrandAddress(brand);
  if (!address) return null;

  const query = encodeURIComponent(`${brand.name}, ${address}`);

  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-brand-line bg-brand-cream md:min-h-full">
      <iframe
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        title={`Bản đồ đường đến ${brand.name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0"
        allowFullScreen
      />
    </div>
  );
}
