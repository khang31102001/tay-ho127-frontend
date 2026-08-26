"use client";

import { useRef } from "react";
import { useCart } from "@/contexts/cart-context";
import { useFlyToCart } from "@/contexts/fly-to-cart-context";
import { formatCurrency } from "@/data/menu-items";
import { UiProduct } from "@/types/menu";
import Image from "next/image";
import { Star } from "lucide-react";
import BestSellerBanner from "../product/BestSellerBanner";

type ProductCardProps = {
  item: UiProduct;
};

/**
 * Màu badge danh mục ở góc phải ảnh, theo đúng màu dùng cho từng
 * loại món trên toàn site (đỏ = món mặn, xanh = món chay).
 */
const CATEGORY_BADGE_CLASS: Record<string, string> = {
  "Món mặn": "bg-brand-red",
  "Món chay": "bg-brand-green",
  "Ăn kèm": "bg-brand-wood",
};

export function ProductCard({ item }: ProductCardProps) {
  const { addToCart } = useCart();
  const { flyToCart } = useFlyToCart();
  const imageRef = useRef<HTMLImageElement>(null);
  const filledStars = Math.round(item.rating);

  const cartProduct = {
    id: String(item.id),
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

  return (
    <article className="relative flex h-full flex-col rounded-md border border-brand-red bg-brand-cream shadow-card">
      {/* <BestSellerBanner/> */}
      <div className="relative overflow-hidden h-[142px] ">
        <Image
          ref={imageRef}
          src={item.image}
          alt={item.name}
          width={100}
          height={142}
          className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
        />
        <span
          className={`absolute right-2 top-2 rounded px-2 py-1 text-[10px] font-black text-white ${
            CATEGORY_BADGE_CLASS[item.category] ?? "bg-brand-red"
          }`}
        >
          {item.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
        <h3 className="line-clamp-2 text-[20px] font-extrabold leading-[1.15] text-brand-greenDark sm:text-[22px]">
          {item.name}
        </h3>

        {/* Khoảng đệm co giãn: đẩy giá/rating/CTA xuống cùng baseline giữa các card */}
        <div className="flex-1" />

        <div className="mt-3 text-right">
          <span className="text-[20px] font-extrabold text-black sm:text-[22px]">{formatCurrency(item.price)}</span>
          {item.oldPrice && <span className="ml-1 text-[13px] text-[#8a8a8a] line-through">{formatCurrency(item.oldPrice)}</span>}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1 text-[#1f1f1f]">
            <span className="flex shrink-0 items-center gap-[1px]">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={index < filledStars ? "text-brand-red" : "text-gray-300"}
                  size={14}
                  fill="currentColor"
                  strokeWidth={0}
                />
              ))}
            </span>
            <span className="truncate text-[12px]">({item.ratingCount}) đánh giá</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              aria-label={`Thêm ${item.name} vào giỏ hàng`}
              onClick={handleAddToCart}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-red text-xl font-black leading-none text-white"
            >
              +
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              className="h-10 shrink-0 whitespace-nowrap rounded-md bg-brand-red px-4 text-center text-[15px] font-bold leading-none text-white"
            >
              Đặt ngay
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
