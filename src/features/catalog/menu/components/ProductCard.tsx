"use client";

import { useRef } from "react";
import { useCart, useFlyToCart } from "@/features/cart";
import { useFavorites } from "@/features/favorites";
import { ORDERING_ENABLED } from "@/core/config/features";
import { formatCurrency } from "@/core/utils/format-currency";
import { UiProduct } from "../types/menu.types";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { CATEGORY_BADGE_CLASS } from "../constants/category-badge";
import { ProtectedProductImage } from "./ProtectedProductImage";

/**
 * `sizes` mặc định khớp lưới Thực đơn / Liên hệ: 2 cột (<768px), 3 cột (md),
 * 4 cột (lg, tối đa 270px ở Container 1280px). Phần trừ đi là lề Container
 * (px-5 / sm:px-8 / lg:px-16) cộng các khoảng gap giữa cột. Nơi dùng card ở
 * độ rộng khác (carousel trang chủ, Sản phẩm liên quan) truyền `sizes` riêng.
 */
export const PRODUCT_GRID_IMAGE_SIZES =
  "(min-width: 1280px) 270px, (min-width: 1024px) calc((100vw - 200px) / 4), (min-width: 768px) calc((100vw - 104px) / 3), (min-width: 640px) calc((100vw - 84px) / 2), calc((100vw - 52px) / 2)";

type ProductCardProps = {
  item: UiProduct;
  /** `sizes` cho next/image theo độ rộng card thực tế ở nơi dùng. */
  sizes?: string;
};

export function ProductCard({ item, sizes = PRODUCT_GRID_IMAGE_SIZES }: ProductCardProps) {
  const { addToCart } = useCart();
  const { flyToCart } = useFlyToCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const imageRef = useRef<HTMLImageElement>(null);
  const filledStars = Math.round(item.rating);
  const favorited = isFavorite(item.slug);

  /**
   * Dùng item.productId (= ManagedProduct.id thật, xem menu.types.ts) làm
   * CartProduct.productId — KHÔNG dùng item.id (chỉ là số thứ tự hiển thị
   * trong danh sách hiện tại). Không còn bước chọn Modifier khi Add to Cart —
   * các tùy chọn dùng chung (Nước mắm/Rau...) giờ là General Order Options,
   * chọn 1 lần cho cả đơn ở Mini Cart/Cart Page (xem features/order-options).
   */
  const cartProduct = {
    productId: item.productId,
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
  const hasRating = item.ratingCount > 0;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-md border border-brand-red bg-brand-cream">
      {/* Ảnh gốc 1000×1000 → khung vuông 1:1, ảnh hiện trọn không bị cắt. */}
      <Link href={detailHref} className="relative block aspect-square overflow-hidden" aria-label={`Xem chi tiết ${item.name}`}>
        <ProtectedProductImage
          ref={imageRef}
          src={item.image}
          alt={item.name}
          fill
          sizes={sizes}
          logoClassName="w-[20%] md:w-[22%]"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {item.badge && (
          <span
            className={`absolute right-2 top-2 rounded px-1.5 py-1 text-[9px] font-black leading-none text-white md:px-2 md:text-[10px] ${
              CATEGORY_BADGE_CLASS[item.badge] ?? "bg-brand-red"
            }`}
          >
            {item.badge}
          </span>
        )}
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
        className="absolute left-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center text-white transition hover:scale-110 active:scale-95"
      >
        <Star
          strokeWidth={2}
          className={`h-[18px] w-[18px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] md:h-[22px] md:w-[22px] ${
            favorited ? "fill-white" : "fill-transparent"
          }`}
        />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 md:p-3 lg:p-3.5">
        <h3 className="line-clamp-2 text-[15px] font-extrabold leading-[1.2] text-brand-greenDark md:text-[17px] lg:text-[19px]">
          <Link href={detailHref}>{item.name}</Link>
        </h3>

        {/* Mô tả: ẩn trên điện thoại, 1 dòng ở tablet, 2 dòng ở desktop. */}
        {item.description && (
          <p className="hidden text-[13px] leading-snug text-brand-muted md:line-clamp-1 lg:line-clamp-2 lg:text-[14px]">
            {item.description}
          </p>
        )}

        {/* Khoảng đệm co giãn: đẩy đánh giá/giá/CTA xuống cùng baseline giữa các card */}
        <div className="flex-1" />

        {/* Món chưa có đánh giá thì ẩn hẳn dòng này thay vì hiện "(0) đánh giá". */}
        {hasRating && (
          <div className="flex min-w-0 items-center gap-1 text-[11px] text-[#1f1f1f] md:text-[12px]">
            <Star className="shrink-0 text-brand-red md:hidden" size={12} fill="currentColor" strokeWidth={0} aria-hidden />
            <span className="hidden shrink-0 items-center gap-[1px] md:flex" aria-hidden>
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
            <span className="truncate">
              <span className="font-bold">{item.rating.toFixed(1)}</span>
              <span className="text-[#8a8a8a]"> ({item.ratingCount})</span>
              <span className="sr-only"> lượt đánh giá</span>
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 whitespace-nowrap">
            <span className="text-[16px] font-extrabold text-black md:text-[18px] lg:text-[20px]">{formatCurrency(item.price)}</span>
            {item.oldPrice && (
              <span className="ml-1 hidden text-[12px] text-[#8a8a8a] line-through md:inline lg:text-[13px]">
                {formatCurrency(item.oldPrice)}
              </span>
            )}
          </p>

          {/*
           * TẠM TẮT nút "Thêm vào giỏ" vì tính năng giỏ hàng chưa public — giữ code để bật lại
           * bằng cách bỏ comment khối dưới. Khi bật: desktop hiện "+ Thêm",
           * tablet/điện thoại chỉ còn icon "+"; bấm sẽ addToCart + hiệu ứng ảnh
           * bay vào giỏ (handleAddToCart), vẫn phụ thuộc cờ ORDERING_ENABLED.
           */}
          {/* {ORDERING_ENABLED && (
            <button
              type="button"
              aria-label={`Thêm ${item.name} vào giỏ hàng`}
              onClick={handleAddToCart}
              className="flex h-9 w-9 shrink-0 items-center justify-center gap-1 rounded-md bg-brand-red font-black text-white transition hover:bg-brand-redDark active:scale-95 md:h-[38px] md:w-[38px] lg:h-10 lg:w-auto lg:px-3.5"
            >
              <Plus size={20} strokeWidth={3} aria-hidden />
              <span className="hidden text-[15px] lg:inline">Thêm</span>
            </button>
          )} */}
        </div>
      </div>
    </article>
  );
}
