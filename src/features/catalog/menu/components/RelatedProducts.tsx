import type { UiProduct } from "../types/menu.types";
import { ProductCard } from "./ProductCard";

/** Lưới 2 cột (<1024px) / 4 cột (lg) trong Container — xem PRODUCT_GRID_IMAGE_SIZES. */
const RELATED_IMAGE_SIZES =
  "(min-width: 1280px) 270px, (min-width: 1024px) calc((100vw - 200px) / 4), (min-width: 640px) calc((100vw - 84px) / 2), calc((100vw - 52px) / 2)";

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

      {/* Tối đa 4 món (RELATED_PRODUCTS_LIMIT): 2 cột tới tablet, 4 cột desktop. */}
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6">
        {items.map((item) => (
          <ProductCard key={item.slug} item={item} sizes={RELATED_IMAGE_SIZES} />
        ))}
      </div>
    </section>
  );
}
