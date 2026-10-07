// Import ButtonLink cho CTA.
import { ButtonLink } from "@/components/ui/ButtonLink";
// Import Container chuẩn.
import { Container } from "@/components/ui/Container";
import type { SiteBrand } from "@/features/brand-profile/types/brand-profile.types";
import {
  formatBrandAddress,
  formatOpeningHours,
  getContactPhone,
  toTelHref,
} from "@/features/brand-profile/utils/site-contact";

// CTA cuối trang dẫn khách xem menu hoặc đến quán.
export function CTASection({ brand }: { brand: SiteBrand }) {
  const address = formatBrandAddress(brand);
  const openingHours = formatOpeningHours(brand);
  const phoneHref = toTelHref(getContactPhone(brand));
  // Render block đỏ-xanh mạnh theo nhận diện thương hiệu.
  return (
    <section className="bg-white pb-16 md:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-[40px] bg-brand-green p-8 text-white md:p-12 lg:p-16">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-red/70 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-white/70">Đến quán hoặc xem món trước</p>
            <h2 className="mt-4 font-display text-4xl font-black uppercase leading-none md:text-6xl">Sẵn sàng cho một phần bánh cuốn nóng?</h2>
            {(address || openingHours) && (
              <p className="mt-5 text-base leading-8 text-white/80">
                {address}
                {address && openingHours ? ". " : ""}
                {openingHours && `Mở cửa ${openingHours}.`}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/thuc-don" variant="light">Xem thực đơn</ButtonLink>
              {phoneHref && <ButtonLink href={phoneHref} variant="outline">Gọi quán</ButtonLink>}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
