import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

import { ProductCard, type UiProduct } from "@/features/catalog/menu";
import type { SlotContent } from "@/features/content/public";
import { Container } from "@/shared/ui/Container";

type ContactFeaturedDishesProps = {
  /** Món trong Menu-SP "mon-yeu-thich" (fetchFeaturedMenu) — Admin chọn món nào hiện ở đây. */
  items: UiProduct[];
  /** Ô "featured-dishes" của trang Liên hệ (Admin): eyebrow, heading, CTA = nút xem thực đơn. */
  content: SlotContent;
};

export function ContactFeaturedDishes({ items, content }: ContactFeaturedDishesProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="contact-featured-dishes" className="section-padding bg-brand-cream">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {content.eyebrow && (
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-red">{content.eyebrow}</p>
            )}
            {content.heading && (
              <h2 id="contact-featured-dishes" className="heading-section mt-2 text-brand-green">
                {content.heading}
              </h2>
            )}
          </div>
          {content.cta && (
            <Link
              href={content.cta.href}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-5 py-2.5 text-sm font-bold text-brand-ink transition hover:border-brand-red hover:text-brand-red"
            >
              <UtensilsCrossed size={16} aria-hidden="true" />
              {content.cta.label}
            </Link>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {items.map((item) => (
            <ProductCard key={item.productId} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
