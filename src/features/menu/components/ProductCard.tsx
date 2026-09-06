"use client";

import { useRef } from "react";
import { useCart, useFlyToCart } from "@/features/cart";
import { useFavorites } from "@/features/favorites";
import { formatCurrency } from "@/lib/format-currency";
import { UiProduct } from "../types/menu.types";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import BestSellerBanner from "./BestSellerBanner";
import { CATEGORY_BADGE_CLASS } from "../constants/category-badge";

type ProductCardProps = {
  item: UiProduct;
};

export function ProductCard({ item }: ProductCardProps) {
  const { addToCart } = useCart();
  const { flyToCart } = useFlyToCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const imageRef = useRef<HTMLImageElement>(null);
  const filledStars = Math.round(item.rating);
  const favorited = isFavorite(item.slug);

  /**
   * Dùng item.slug (= ManagedProduct.id thật, xem menu.types.ts) làm
   * CartProduct.productId — KHÔNG dùng item.id (chỉ là số thứ tự hiển thị
   * trong danh sách hiện tại). Không còn bước chọn Modifier khi Add to Cart —
   * các tùy chọn dùng chung (Nước mắm/Rau...) giờ là General Order Options,
   * chọn 1 lần cho cả đơn ở Mini Cart/Cart Page (xem features/order-options).
   */
  const cartProduct = {
    productId: item.slug,
    name: item.name,
    basePrice: item.price,
    image: item.image,
  };

  function handleAddToCart() {
    addToCart(cartProduct);
    flyToCart({
      sourceElement: imageRef.current,
      imageUrl: item.image,
    });
  }

  function handleToggleFavorite() {
    toggleFavorite(item.slug);
  }

  const detailHref = `/thuc-don/${item.slug}`;

  return (
    <article className="relative flex h-full flex-col rounded-md border border-brand-red bg-brand-cream shadow-card">
      {/* <BestSellerBanner/> */}
      <Link href={detailHref} className="relative block overflow-hidden h-[142px]" aria-label={`Xem chi tiết ${item.name}`}>
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
      </Link>

      {/*
       * Nút "Yêu thích" — nằm NGOÀI <Link> (không lồng <button> trong <a>, vi
       * phạm HTML content model + gây hydration mismatch) dù định vị chồng lên
       * cùng vị trí góc trên-trái ảnh nhờ article cha đã có position: relative.
       */}
      <button
        type="button"
        onClick={handleToggleFavorite}
        aria-label={favorited ? `Bỏ ${item.name} khỏi yêu thích` : `Thêm ${item.name} vào yêu thích`}
        aria-pressed={favorited}
        className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center text-white transition hover:scale-110 active:scale-95"
      >
        <Star
          size={22}
          strokeWidth={2}
          className={favorited ? "fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : "fill-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"}
        />
      </button>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
        <h3 className="line-clamp-2 text-[20px] font-extrabold leading-[1.15] text-brand-greenDark sm:text-[22px]">
          <Link href={detailHref} className="">
            {item.name}
          </Link>
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
          </div>
        </div>
      </div>
    </article>
  );
}
