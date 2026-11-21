"use client";

import { useRef } from "react";
import Link from "next/link";

import { useCart, useFlyToCart } from "@/features/cart";
import { formatCurrency } from "@/core/utils/format-currency";
import type { UiProduct } from "../types/menu.types";
import { ProtectedProductImage } from "./ProtectedProductImage";

type MenuItemCardProps = {
  item: UiProduct;
};

/**
 * Thẻ món gọn cho trang /thuc-don: ảnh, tên, giá + nút "+" cùng một hàng.
 * Khác `ProductCard` (dùng ở trang chủ / món liên quan) ở chỗ không có sao đánh
 * giá và yêu thích — trang thực đơn ưu tiên mật độ và thêm món nhanh.
 */
export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart } = useCart();
  const { flyToCart } = useFlyToCart();
  const imageRef = useRef<HTMLImageElement>(null);
  const detailHref = `/thuc-don/${item.slug}`;

  function handleAddToCart() {
    // productId = ManagedProduct.id thật (không phải item.id là số thứ tự hiển thị).
    addToCart({
      productId: item.productId,
      name: item.name,
      basePrice: item.price,
      image: item.image,
    });
    flyToCart({ sourceElement: imageRef.current, imageUrl: item.image });
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-brand-red/40 bg-brand-cream shadow-card">
      <Link
        href={detailHref}
        className="relative block aspect-square overflow-hidden"
        aria-label={`Xem chi tiết ${item.name}`}
      >
        <ProtectedProductImage
          ref={imageRef}
          src={item.image}
          alt={item.name}
          width={400}
          height={400}
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-brand-greenDark sm:text-[15px]">
          <Link href={detailHref}>{item.name}</Link>
        </h3>

        <div className="flex-1" />

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[15px] font-extrabold text-black sm:text-[16px]">
            {formatCurrency(item.price)}
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Thêm ${item.name} vào giỏ hàng`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-red text-xl font-black leading-none text-white transition hover:opacity-90 active:scale-95"
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
