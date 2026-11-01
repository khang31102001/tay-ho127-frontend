import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/shared/ui/Container";

type ContactVisitIntroProps = {
  brandName: string;
  /** Địa chỉ chi nhánh chính (Admin nhập); rỗng thì câu mở đầu bỏ phần địa chỉ. */
  address: string;
};

/**
 * Đoạn giới thiệu riêng của địa điểm (chứa tên + địa chỉ trong câu) — các trang địa điểm F&B đều có, giúp Google gắn
 * nội dung với nơi chốn. Phần lịch sử/Michelin theo nguồn đã kiểm chứng ở trang Giới thiệu.
 */
export function ContactVisitIntro({ brandName, address }: ContactVisitIntroProps) {
  return (
    <section aria-labelledby="contact-visit-intro" className="section-padding bg-white">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-[1.3fr_0.7fr] md:gap-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-red">Ghé quán</p>
            <h2 id="contact-visit-intro" className="heading-section mt-2 text-brand-green">
              Ăn sáng ở {brandName}
            </h2>
            <p className="mt-4 text-[15px] font-medium leading-7 text-brand-ink/85 sm:text-[16px]">
              {address ? `${brandName} nằm tại ${address}. ` : ""}
              Quán bán bánh cuốn từ năm 1961: bánh tráng mỏng, nhân thịt mộc nhĩ, ăn cùng chả lụa, chả quế và nước mắm
              thơm cà cuống. Khách ghé ăn sáng, ăn trưa hay đặt mang về đều được phục vụ nhanh.
            </p>
            <p className="mt-3 text-[15px] font-medium leading-7 text-brand-ink/85 sm:text-[16px]">
              Năm 2026, quán được Cẩm nang MICHELIN Việt Nam trao danh hiệu Bib Gourmand, dành cho những quán ngon với giá
              hợp lý.
            </p>
            <Link
              href="/gioi-thieu"
              className="focus-ring mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-red underline-offset-4 hover:underline sm:text-[15px]"
            >
              Đọc câu chuyện hơn 60 năm của quán
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[240px]">
            <Image
              src="/images/michelin-guide.png"
              alt="Cẩm nang MICHELIN Việt Nam 2026: Bánh Cuốn Tây Hồ 127 đạt Bib Gourmand"
              fill
              sizes="240px"
              className="object-contain"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
