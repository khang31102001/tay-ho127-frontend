import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MapPin, UtensilsCrossed } from "lucide-react";

import { Container } from "@/shared/ui/Container";

/* ============================================================
 * DATA — nguồn công khai để khách (và Google) đối chiếu danh hiệu.
 * ========================================================== */

const pressSources = [
  {
    label: "Cẩm nang MICHELIN Việt Nam 2026",
    href: "https://guide.michelin.com/en/article/michelin-guide-ceremony/michelin-guide-vietnam-2026",
  },
  {
    label: "Báo Đà Nẵng: Bánh cuốn Tây Hồ 127 được Michelin vinh danh",
    href: "https://baodanang.vn/banh-cuon-tay-ho-127-duoc-michelin-vinh-danh-3340407.html",
  },
];

/* ============================================================
 * COMPONENT
 * ========================================================== */

export function AboutMichelin() {
  return (
    <section aria-labelledby="about-michelin" className="section-padding bg-brand-ink bg-hero text-white">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
          <div className="relative mx-auto aspect-square w-full max-w-[280px]">
            <Image
              src="/images/michelin-guide.png"
              alt="Cẩm nang MICHELIN Việt Nam 2026"
              fill
              sizes="280px"
              className="object-contain"
            />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Ghi nhận</p>
            <h2 id="about-michelin" className="heading-section mt-2 text-white">
              MICHELIN Bib Gourmand 2026
            </h2>
            <p className="mt-4 text-[15px] font-medium leading-7 text-white/80 sm:text-[16px]">
              Tháng 6/2026, Cẩm nang MICHELIN Việt Nam công bố danh sách Bib Gourmand, trong đó có Bánh Cuốn Tây Hồ 127
              cùng bốn quán ăn khác của TP. Hồ Chí Minh lần đầu được ghi nhận. Các thanh tra MICHELIN nhắc đến quán như một
              tiệm nhỏ năm nào, nay thành căn tiệm hai tầng nổi tiếng với những cuốn bánh mỏng mềm.
            </p>
            <p className="mt-3 text-[15px] font-medium leading-7 text-white/80 sm:text-[16px]">
              Với gia đình, danh hiệu đến như một bất ngờ: quán chưa bao giờ chạy theo giải thưởng, chỉ cố gắng giữ trọn
              hương vị và hình ảnh đã làm nên tên Tây Hồ.
            </p>

            <ul className="mt-6 space-y-2">
              {pressSources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-white underline-offset-4 hover:underline"
                  >
                    <ExternalLink size={15} aria-hidden="true" />
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/thuc-don"
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                <UtensilsCrossed size={16} aria-hidden="true" />
                Xem thực đơn
              </Link>
              <Link
                href="/lien-he"
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <MapPin size={16} aria-hidden="true" />
                Liên hệ & chỉ đường
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
