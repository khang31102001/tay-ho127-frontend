"use client";

import { Container } from "../ui/Container";
import Link from "next/link";
import { ChevronRightIcon, MoveLeftIcon } from "lucide-react";

import { ProductCard } from "@/components/menu/ProductCard";
import { Reveal } from "../common/Reveal";
import { SwiperCarousel } from "@/components/ui/SwiperCarousel";
import MenuBackgroundDecoration from "../ui/MenuBackgroundDecoration";

import { menuItems } from "@/data/menu-items";

/**
 * Thời gian tự động chuyển sản phẩm.
 *
 * 6.000 ms = 6 giây.
 */
const AUTO_PLAY_DELAY = 6_000;

/* =========================================================
 * COMPONENT FAVORITE SECTION
 * ======================================================= */

export function FavoriteSection() {
  /**
   * Lấy 6 sản phẩm đầu tiên. Swiper chỉ loop mượt khi số sản phẩm
   * >= 2 lần slidesPerView; desktop hiển thị 3 slide cùng lúc nên
   * cần tối thiểu 6 để nút prev/next và autoplay thực sự có tác dụng.
   */
  const favorites = menuItems.slice(0, 6);

  /**
   * Nếu không có dữ liệu sản phẩm
   * thì không render section.
   */
  if (favorites.length === 0) {
    return null;
  }

  /**
   * Swiper chỉ loop mượt khi số sản phẩm >= 2 lần số slide hiển thị
   * cùng lúc. Với đúng 3 sản phẩm, slidesPerView 2-3 không đủ điều
   * kiện nên tắt loop ở các breakpoint đó để tránh nút/dot bị "kẹt".
   */
  const canLoop = (slidesPerView: number) =>
    favorites.length >= slidesPerView * 2;

  return (
    <section
      className="
        relative flex
        min-h-svh
        flex-col justify-center
        overflow-hidden
        bg-orange-400
        pb-10
        pt-24
        md:pb-12
        md:pt-28
      "
    >
      <MenuBackgroundDecoration leftColor="rgba(255,255,255,0.18)" rightColor="rgba(255,255,255,0.18)" />

      <Container className="">
        {/* =================================================
         * HEADER
         * =============================================== */}
        <div
          className="
            relative
            mb-10
            flex
            items-center
            justify-center
          "
        >
          <Reveal type="fade-up">
            <h2 className="heading-section text-center text-white">
              Những lựa chọn được yêu thích nhất
            </h2>
          </Reveal>
          <Link
            href="/menu"
            className="
              absolute
              right-0
              hidden
              items-center
              rounded-md
              bg-brand-green
              px-6
              py-3
              text-[14px]
              font-black
              text-white
              transition
              hover:opacity-90
              active:scale-[0.98]
              md:inline-flex
            "
          >
            <span className="flex items-center gap-2">
              Xem thực đơn
              <MoveLeftIcon
                className="
                  h-4
                  w-4
                  rotate-180
                "
              />
            </span>
          </Link>
        </div>

        {/* =================================================
         * PRODUCT CAROUSEL
         * =============================================== */}
        <Reveal type="fade-up">
          <SwiperCarousel
            slidesPerView={1}
            slidesPerGroup={1}
            spaceBetween={24}
            breakpoints={{
              768: {
                slidesPerView: 2,
                slidesPerGroup: 1,
                loop: canLoop(2),
              },
              1024: {
                slidesPerView: 3,
                slidesPerGroup: 1,
                loop: canLoop(3),
              },
            }}
            autoplayDelay={AUTO_PLAY_DELAY}
            loop={canLoop(1)}
            navigation
            pagination
            className="
              px-12
              text-tayho-orange
              sm:px-14

              [--swiper-pagination-bullet-inactive-color:white]
              [--swiper-pagination-bullet-inactive-opacity:0.5]
              [--swiper-pagination-bullet-size:8px]
              [--swiper-pagination-color:white]

              [&_.swiper-wrapper]:pt-3
              [&_.swiper-slide]:!h-auto
              [&_.swiper-slide]:self-stretch
            "
          >
            {favorites.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </SwiperCarousel>
        </Reveal>

        {/* =================================================
         * MOBILE MENU LINK
         * =============================================== */}
        <div className="mt-6 flex justify-center md:hidden">
          <Link
            href="/menu"
            className="
              flex items-center gap-2
              rounded-full
              bg-[#159447]
              px-5 py-2.5
              text-[13px] font-bold
              text-white
            "
          >
            Xem thực đơn
            <ChevronRightIcon className="h-4 w-4" strokeWidth={3} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
