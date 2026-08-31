"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { useCart, useFlyToCart } from "@/features/cart";
import { formatCurrency } from "@/lib/format-currency";
import type { UiProduct } from "../types/menu.types";
import { CATEGORY_BADGE_CLASS } from "../constants/category-badge";

type CrossSellProductCardProps = {
  item: UiProduct;
};

/**
 * Biến thể GỌN của ProductCard — dùng riêng cho carousel "Có thể bạn muốn
 * dùng thêm" (Cart Page /gio-hang, đặt trong khung max-w-[730px] nên mỗi thẻ
 * chỉ có ~220px khi hiện 3 thẻ/hàng — hẹp hơn nhiều so với lưới Thực đơn/Trang
 * chủ/Sản phẩm liên quan, nơi ProductCard gốc đang dùng). Không sửa trực tiếp
 * ProductCard vì nó đang phục vụ 4 nơi khác với không gian rộng hơn — thu nhỏ
 * font/ảnh ở đó sẽ làm những chỗ đó sai tỷ lệ.
 *
 * Chỉ 1 nút "+" (không có "Đặt ngay", không hiện rating) để vừa không gian
 * hẹp — khớp đúng ví dụ nghiệp vụ gốc "[+ Thêm] → thêm trực tiếp vào Cart".
 * Hành vi thêm-vào-giỏ giữ nguyên như ProductCard (productId = item.slug).
 */
export function CrossSellProductCard({ item }: CrossSellProductCardProps) {
  const { addToCart } = useCart();
  const { flyToCart } = useFlyToCart();
  const imageRef = useRef<HTMLImageElement>(null);

  const cartProduct = {
    productId: item.slug,
    name: item.name,
    price: item.price,
    image: item.image,
  };

  function handleAddToCart() {
    addToCart(cartProduct);
    flyToCart({
      sourceElement: imageRef.current,
      imageUrl: item.image,
    });
  }

  const detailHref = `/thuc-don/${item.slug}`;

  return (
    <article className="flex h-full flex-col rounded-md border border-brand-red bg-brand-cream shadow-card">
      <Link
        href={detailHref}
        className="relative block h-[92px] overflow-hidden"
        aria-label={`Xem chi tiết ${item.name}`}
      >
        <Image
          ref={imageRef}
          src={item.image}
          alt={item.name}
          width={100}
          height={92}
          className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
        />
        <span
          className={`absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-black text-white ${
            CATEGORY_BADGE_CLASS[item.category] ?? "bg-brand-red"
          }`}
        >
          {item.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
        <h3 className="line-clamp-2 text-[13px] font-extrabold leading-tight text-brand-greenDark">
          <Link href={detailHref}>{item.name}</Link>
        </h3>

        <div className="flex-1" />

        <div className="mt-1.5 flex items-center justify-between gap-1.5">
          <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-black">
            {formatCurrency(item.price)}
          </span>

          <button
            type="button"
            aria-label={`Thêm ${item.name} vào giỏ hàng`}
            onClick={handleAddToCart}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-red text-base font-black leading-none text-white"
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
