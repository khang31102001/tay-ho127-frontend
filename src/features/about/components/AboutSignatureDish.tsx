import Image from "next/image";

import { site } from "@/core/config/site-data";
import type { SlotContent } from "@/features/content/public";
import { Container } from "@/shared/ui/Container";

/* ============================================================
 * COMPONENT
 * ========================================================== */

type AboutSignatureDishProps = {
  /** Ô "signature-dish" của trang Giới thiệu (Admin): eyebrow, heading, nội dung = các ý (mỗi dòng một ý), ảnh món. */
  content: SlotContent;
};

const DEFAULT_IMAGE = { src: site.assets.dishPhoto, alt: "Đĩa bánh cuốn Tây Hồ 127 rắc hành phi, ăn kèm chả lụa" };

export function AboutSignatureDish({ content }: AboutSignatureDishProps) {
  const image = content.image ?? DEFAULT_IMAGE;

  return (
    <section aria-labelledby="about-signature-dish" className="section-padding bg-white">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            {content.eyebrow && (
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-red">{content.eyebrow}</p>
            )}
            <h2 id="about-signature-dish" className="heading-section mt-2 text-brand-green">
              {content.heading}
            </h2>
            <ul className="mt-6 space-y-3">
              {content.lines.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-[15px] font-medium leading-7 text-brand-ink/85">
                  <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand-red" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
