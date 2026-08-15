"use client";

import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/data/menu-items";
import { UiProduct } from "@/types/menu";
import Image from "next/image";
import BestSellerBanner from "../product/tag-best-seller";

type ProductCardProps = {
  item: UiProduct;
};

export function ProductCard({ item }: ProductCardProps) {
  const { addToCart } = useCart();

  const cartProduct = {
    id: String(item.id),
    name: item.name,
    price: item.price,
    image: item.image,
  };

  return (
    <article className="relative overflow-visible rounded-md border border-brand-red bg-brand-cream shadow-card">
      <BestSellerBanner/>
      <div className="relative overflow-hidden h-[142px] ">
        <Image src={item.image} alt={item.name} width={100} height={142} className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105" />
        {item.badge && (
          <span className="absolute right-2 top-2 rounded bg-brand-red px-2 py-1 text-[10px] font-black text-white">
            {item.badge}
          </span>
        )}
        
        
      </div>

      <div className="min-h-[136px] px-3 pb-2 pt-3">
        <h3 className="min-h-[48px] text-[16px] font-black leading-5 text-brand-greenDark">{item.name}</h3>
        <div className="mt-3 flex items-end justify-end gap-2">
          <div className="text-right text-[15px] font-black text-black">
            {item.oldPrice && <span className="mr-1 text-[13px] text-[#5f5f5f] line-through">{formatCurrency(item.oldPrice)}</span>}
            <span>{formatCurrency(item.price)}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-[#1f1f1f] sm:flex-1">
            <span className="whitespace-nowrap">★★★★★</span>{" "}
            <span>({item.ratingCount}) đánh giá</span>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              aria-label={`Thêm ${item.name} vào giỏ hàng`}
              onClick={() => addToCart(cartProduct)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-brand-red text-lg font-black leading-none text-white"
            >
              +
            </button>

            <button
              type="button"
              onClick={() => addToCart(cartProduct)}
              className="min-h-8 shrink-0 whitespace-nowrap rounded bg-brand-red px-3 py-1.5 text-center text-[12px] font-bold leading-none text-white"
            >
              Đặt ngay
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
