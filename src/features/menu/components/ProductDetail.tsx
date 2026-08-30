import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Star } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { formatCurrency } from "@/lib/format-currency";
import type { ProductDetailData } from "../services/menu.service";
import { CATEGORY_BADGE_CLASS } from "../constants/category-badge";
import { ProductActions } from "./ProductActions";
import { RelatedProducts } from "./RelatedProducts";

type ProductDetailProps = {
  data: ProductDetailData;
};

export function ProductDetail({ data }: ProductDetailProps) {
  const { product, relatedProducts } = data;
  const filledStars = Math.round(product.rating);

  return (
    <section className="section-padding">
      <Container>
        {/* Breadcrumb / quay lại thực đơn */}
        <Link
          href="/thuc-don"
          className="focus-ring inline-flex items-center gap-1.5 rounded-full text-sm font-bold text-brand-green transition hover:opacity-80"
        >
          <ChevronLeft size={18} />
          Quay lại Thực đơn
        </Link>

        <Reveal type="fade-up" className="mt-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Ảnh sản phẩm */}
            <div className="relative aspect-square w-full overflow-hidden rounded-card border border-brand-line bg-white shadow-soft">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />

              <span
                className={`absolute left-4 top-4 rounded px-3 py-1 text-xs font-black text-white ${
                  CATEGORY_BADGE_CLASS[product.category] ?? "bg-brand-red"
                }`}
              >
                {product.category}
              </span>
            </div>

            {/* Thông tin + hành động */}
            <div className="flex flex-col">
              {product.badge && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full border border-brand-line bg-brand-cream px-3 py-1 text-[11px] font-black uppercase tracking-wide text-brand-muted">
                  {product.badge}
                </span>
              )}

              <h1 className="heading-1 text-brand-ink">{product.name}</h1>

              <div className="mt-3 flex items-center gap-2 text-[#1f1f1f]">
                <span className="flex items-center gap-[1px]">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={index < filledStars ? "text-brand-red" : "text-gray-300"}
                      size={18}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </span>
                <span className="text-sm text-brand-muted">
                  ({product.ratingCount}) đánh giá
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-[32px] font-black text-brand-ink">
                  {formatCurrency(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-base text-[#8a8a8a] line-through">
                    {formatCurrency(product.oldPrice)}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="body-lead mt-5">{product.description}</p>
              )}

              <div className="mt-8 border-t border-brand-line pt-6">
                <ProductActions product={product} />
              </div>
            </div>
          </div>
        </Reveal>

        <RelatedProducts items={relatedProducts} />
      </Container>
    </section>
  );
}
