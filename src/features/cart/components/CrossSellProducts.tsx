"use client";

import { useEffect, useState } from "react";

// Import thẳng service/component/type (không qua barrel @/features/menu) —
// barrel đó không re-export UI admin, nhưng đi thẳng path vẫn giữ nhất quán
// với quy ước toàn repo cho code chạy ở Site.
import { fetchCrossSellProducts } from "@/features/menu/services/menu.service";
import { CrossSellProductCard } from "@/features/menu/components/CrossSellProductCard";
import type { UiProduct } from "@/features/menu/types/menu.types";
import { SwiperCarousel } from "@/components/ui/SwiperCarousel";
import { useCart } from "../context/cart-context";

/** Tự động chuyển slide mỗi 4 giây — "tự nhảy" theo yêu cầu. */
const AUTO_PLAY_DELAY = 4_000;

/**
 * Section "Có thể bạn muốn dùng thêm" trong Cart Page — dữ liệu lấy động từ
 * Menu "Gợi ý thêm món" (Admin quản lý qua Catalog → Thực đơn/Liên kết
 * Menu-SP), KHÔNG hard-code danh sách món. Dùng SwiperCarousel (đã có sẵn,
 * cùng cách FavoriteSection dùng ở trang chủ) thay vì lưới tĩnh — mặc định
 * hiện 3 thẻ trên desktop, tự động chuyển. CrossSellProductCard (không phải
 * ProductCard) vì khung Cart Page hẹp hơn nhiều so với lưới Thực đơn/Trang chủ.
 */
export function CrossSellProducts() {
  const { cartItems } = useCart();
  const [items, setItems] = useState<UiProduct[] | null>(null);

  useEffect(() => {
    let isCancelled = false;
    fetchCrossSellProducts().then((data) => {
      if (!isCancelled) setItems(data);
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  if (!items || items.length === 0) {
    return null;
  }

  const cartProductIds = new Set(cartItems.map((item) => item.productId));
  const suggestions = items.filter((item) => !cartProductIds.has(item.slug));

  if (suggestions.length === 0) {
    return null;
  }

  /** Swiper chỉ loop mượt khi số slide >= 2 lần slidesPerView — tắt loop ở breakpoint không đủ điều kiện thay vì để nút/dot bị "kẹt". */
  const canLoop = (slidesPerView: number) => suggestions.length >= slidesPerView * 2;

  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <h2 className="mb-5 text-[18px] font-black text-brand-green">Có thể bạn muốn dùng thêm</h2>

      <SwiperCarousel
        slidesPerView={1}
        slidesPerGroup={1}
        spaceBetween={12}
        breakpoints={{
          480: {
            slidesPerView: 2,
            slidesPerGroup: 1,
            loop: canLoop(2),
          },
          640: {
            slidesPerView: 3,
            slidesPerGroup: 1,
            loop: canLoop(3),
          },
        }}
        autoplayDelay={AUTO_PLAY_DELAY}
        loop={canLoop(1)}
        navigation
        className="
          px-8

          [&_.swiper-slide]:!h-auto
          [&_.swiper-slide]:self-stretch
        "
      >
        {suggestions.map((item) => (
          <CrossSellProductCard key={item.slug} item={item} />
        ))}
      </SwiperCarousel>
    </section>
  );
}
