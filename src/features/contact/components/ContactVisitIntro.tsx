import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SlotContent } from "@/features/content/public";
import { Container } from "@/shared/ui/Container";

type ContactVisitIntroProps = {
  brandName: string;
  /** Địa chỉ chi nhánh chính (Admin nhập); rỗng thì câu mở đầu bỏ phần địa chỉ. */
  address: string;
  /** Ô "visit-intro" của trang Liên hệ (Admin): eyebrow, heading, các đoạn, ảnh, CTA. */
  content: SlotContent;
};

const DEFAULT_IMAGE = {
  src: "/images/michelin-guide.png",
  alt: "Cẩm nang MICHELIN Việt Nam 2026: Bánh Cuốn Tây Hồ 127 đạt Bib Gourmand",
};

/**
 * Đoạn giới thiệu riêng của địa điểm (chứa tên + địa chỉ trong câu) — các trang địa điểm F&B đều có, giúp Google gắn
 * nội dung với nơi chốn. Phần lịch sử/Michelin theo nguồn đã kiểm chứng ở trang Giới thiệu.
 */
export function ContactVisitIntro({ brandName, address, content }: ContactVisitIntroProps) {
  const image = content.image ?? DEFAULT_IMAGE;
  const addressSentence = address ? `${brandName} nằm tại ${address}. ` : "";

  return (
    <section aria-labelledby="contact-visit-intro" className="section-padding bg-white">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-[1.3fr_0.7fr] md:gap-12">
          <div>
            {content.eyebrow && (
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-red">{content.eyebrow}</p>
            )}
            <h2 id="contact-visit-intro" className="heading-section mt-2 text-brand-green">
              {content.heading}
            </h2>
            {(content.paragraphs.length > 0 ? content.paragraphs : [""]).map((paragraph, index) => (
              <p
                key={`${index}-${paragraph}`}
                className={`${index === 0 ? "mt-4" : "mt-3"} text-[15px] font-medium leading-7 text-brand-ink/85 sm:text-[16px]`}
              >
                {index === 0 && addressSentence}
                {paragraph}
              </p>
            ))}
            {content.cta && (
              <Link
                href={content.cta.href}
                className="focus-ring mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-red underline-offset-4 hover:underline sm:text-[15px]"
              >
                {content.cta.label}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[240px]">
            <Image
              src={image.src}
              alt={image.alt}
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
