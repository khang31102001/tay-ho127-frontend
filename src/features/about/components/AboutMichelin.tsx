import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MapPin, UtensilsCrossed } from "lucide-react";

import type { SlotContent } from "@/features/content/public";
import { Container } from "@/shared/ui/Container";

/* ============================================================
 * COMPONENT
 * ========================================================== */

type AboutMichelinProps = {
  /** Ô "michelin" của trang Giới thiệu (Admin): eyebrow, heading, các đoạn, ảnh, CTA; danh sách = link nguồn báo chí. */
  content: SlotContent;
};

const DEFAULT_IMAGE = { src: "/images/michelin-guide.png", alt: "Cẩm nang MICHELIN Việt Nam 2026" };

export function AboutMichelin({ content }: AboutMichelinProps) {
  const image = content.image ?? DEFAULT_IMAGE;
  const pressSources = content.items.filter((item) => item.title && item.url);

  return (
    <section aria-labelledby="about-michelin" className="section-padding bg-brand-ink bg-hero text-white">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
          <div className="relative mx-auto aspect-square w-full max-w-[280px]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="280px"
              className="object-contain"
            />
          </div>

          <div>
            {content.eyebrow && (
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">{content.eyebrow}</p>
            )}
            <h2 id="about-michelin" className="heading-section mt-2 text-white">
              {content.heading}
            </h2>
            {content.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={`${index === 0 ? "mt-4" : "mt-3"} text-[15px] font-medium leading-7 text-white/80 sm:text-[16px]`}
              >
                {paragraph}
              </p>
            ))}

            {pressSources.length > 0 && (
            <ul className="mt-6 space-y-2">
              {pressSources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-white underline-offset-4 hover:underline"
                  >
                    <ExternalLink size={15} aria-hidden="true" />
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {content.cta && (
                <Link
                  href={content.cta.href}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  <UtensilsCrossed size={16} aria-hidden="true" />
                  {content.cta.label}
                </Link>
              )}
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
