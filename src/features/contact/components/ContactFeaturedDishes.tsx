import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

import { ProductCard, type UiProduct } from "@/features/catalog/menu";
import { Container } from "@/shared/ui/Container";

type ContactFeaturedDishesProps = {
  /** Món trong Menu-SP "mon-yeu-thich" (fetchFeaturedMenu) — Admin chọn món nào hiện ở đây. */
  items: UiProduct[];
};

export function ContactFeaturedDishes({ items }: ContactFeaturedDishesProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="contact-featured-dishes" className="section-padding bg-brand-cream">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-red">Gọi món gì</p>
            <h2 id="contact-featured-dishes" className="heading-section mt-2 text-brand-green">
              Món được gọi nhiều nhất
            </h2>
          </div>
          <Link
            href="/thuc-don"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-5 py-2.5 text-sm font-bold text-brand-ink transition hover:border-brand-red hover:text-brand-red"
          >
            <UtensilsCrossed size={16} aria-hidden="true" />
            Xem toàn bộ thực đơn
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard key={item.productId} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
