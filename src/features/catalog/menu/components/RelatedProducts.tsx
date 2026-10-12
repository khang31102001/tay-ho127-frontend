import type { UiProduct } from "../types/menu.types";
import { ProductCard } from "./ProductCard";

type RelatedProductsProps = {
  items: UiProduct[];
};

export function RelatedProducts({ items }: RelatedProductsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-14">
      <h2 className="heading-3 text-brand-green">Có thể bạn sẽ thích</h2>

      <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 md:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}
