"use client";

import { SwiperCarousel } from "@/shared/ui/SwiperCarousel";
import type { MenuSectionData } from "../types/menu.types";
import { MenuItemCard } from "./MenuItemCard";

/** Tự nhảy trang sau 4 giây (yêu cầu 3–5 giây). */
const MENU_AUTO_PLAY_DELAY = 4_000;

/** Số hàng cố định của mỗi section. */
const MENU_ROWS = 2;

/** Từ ngần này món trở xuống thì vừa 1 trang ở màn nhỏ nhất (2 cột × 2 hàng): không cần trượt. */
const MIN_ITEMS_PER_PAGE = 4;

interface MenuSectionSwiperProps {
  section: MenuSectionData;
}

/** Một section = một thực đơn: danh sách món trượt ngang 2 hàng, tự nhảy trang. */
export function MenuSectionSwiper({ section }: MenuSectionSwiperProps) {
  const canSlide = section.items.length > MIN_ITEMS_PER_PAGE;

  return (
    <SwiperCarousel
      rows={MENU_ROWS}
      slidesPerView={2}
      slidesPerGroup={2}
      spaceBetween={12}
      breakpoints={{
        640: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
        1280: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 16 },
      }}
      autoplayDelay={canSlide ? MENU_AUTO_PLAY_DELAY : undefined}
      rewind
      navigation={canSlide}
      pagination={canSlide}
      className="
        text-brand-red
        lg:px-12
        [--swiper-pagination-bullet-inactive-color:var(--brand-green)]
        [--swiper-pagination-bullet-inactive-opacity:0.3]
        [--swiper-pagination-bullet-size:8px]
        [--swiper-pagination-color:var(--brand-red)]
        max-lg:[&_button]:!hidden
        [&_.swiper-button-lock]:!hidden
        [&_.swiper-pagination-lock]:!hidden
        [&_.swiper-slide]:!h-auto
      "
    >
      {section.items.map((item) => (
        <MenuItemCard key={`${section.id}-${item.productId}`} item={item} />
      ))}
    </SwiperCarousel>
  );
}
