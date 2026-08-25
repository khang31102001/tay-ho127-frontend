"use client";

import { Container } from "../ui/Container";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoveLeftIcon } from "lucide-react";

import { ProductCard } from "@/components/menu/ProductCard";
import { Reveal } from "../common/animation";

import { menuItems } from "@/data/menu-items";

/**
 * Thời gian tự động chuyển sản phẩm.
 *
 * 5.000 ms = 5 giây.
 */
const AUTO_PLAY_DELAY = 5_000;

/**
 * Khoảng cách vuốt tối thiểu để chuyển sản phẩm.
 *
 * Nếu vuốt nhỏ hơn 50px thì không chuyển.
 */
const SWIPE_THRESHOLD = 50;

/* =========================================================
 * COMPONENT FAVORITE SECTION
 * ======================================================= */

export function FavoriteSection() {
  /**
   * Hiện tại chỉ lấy 3 sản phẩm đầu tiên
   * theo logic ban đầu của component.
   */
  const favorites = menuItems.slice(0, 3);

  /**
   * Index của sản phẩm đang hiển thị ở vị trí trung tâm.
   */
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * Khi người dùng rê chuột vào carousel,
   * autoplay sẽ tạm dừng.
   */
  const [isPaused, setIsPaused] = useState(false);

  /**
   * Lưu vị trí bắt đầu chạm
   * để xử lý thao tác swipe trên mobile.
   */
  const touchStartXRef = useRef<number | null>(null);

  /**
   * Index sản phẩm phía trước.
   *
   * Khi activeIndex = 0
   * thì quay về phần tử cuối.
   */
  const previousIndex =
    activeIndex === 0 ? favorites.length - 1 : activeIndex - 1;

  /**
   * Index sản phẩm tiếp theo.
   *
   * Khi activeIndex đang ở phần tử cuối
   * thì quay lại phần tử đầu.
   */
  const nextIndex = activeIndex === favorites.length - 1 ? 0 : activeIndex + 1;

  /**
   * Chuyển sang sản phẩm tiếp theo.
   */
  const handleNext = useCallback(() => {
    setActiveIndex((currentIndex) => {
      return currentIndex === favorites.length - 1 ? 0 : currentIndex + 1;
    });
  }, [favorites.length]);

  /**
   * Chuyển về sản phẩm trước đó.
   */
  const handlePrevious = useCallback(() => {
    setActiveIndex((currentIndex) => {
      return currentIndex === 0 ? favorites.length - 1 : currentIndex - 1;
    });
  }, [favorites.length]);

  /**
   * Tự động chuyển sản phẩm sau mỗi 5 giây.
   *
   * Khi người dùng hover vào carousel:
   * isPaused = true => tạm dừng autoplay.
   */
  useEffect(() => {
    if (isPaused || favorites.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      handleNext();
    }, AUTO_PLAY_DELAY);

    return () => {
      window.clearInterval(timer);
    };
  }, [favorites.length, handleNext, isPaused]);

  /**
   * Xử lý điều hướng bằng bàn phím.
   *
   * ArrowLeft  => sản phẩm trước.
   * ArrowRight => sản phẩm tiếp theo.
   */
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      handlePrevious();
    }

    if (event.key === "ArrowRight") {
      handleNext();
    }
  }

  /**
   * Ghi nhận vị trí bắt đầu swipe.
   */
  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  }

  /**
   * Xử lý khi người dùng kết thúc swipe.
   */
  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartXRef.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX;

    if (touchEndX === undefined) {
      return;
    }

    const swipeDistance = touchEndX - touchStartXRef.current;

    /**
     * Vuốt sang trái:
     * chuyển sang sản phẩm tiếp theo.
     */
    if (swipeDistance < -SWIPE_THRESHOLD) {
      handleNext();
    }

    /**
     * Vuốt sang phải:
     * chuyển về sản phẩm trước.
     */
    if (swipeDistance > SWIPE_THRESHOLD) {
      handlePrevious();
    }

    touchStartXRef.current = null;
  }

  /**
   * Nếu không có dữ liệu sản phẩm
   * thì không render section.
   */
  if (favorites.length === 0) {
    return null;
  }

  const activeItem = favorites[activeIndex];
  const previousItem = favorites[previousIndex];
  const nextItem = favorites[nextIndex];

  return (
    <section
      className="
        relative overflow-hidden
        bg-orange-400
        py-10
        md:py-12
      "
    >
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
        <div
          role="region"
          aria-label="Những món ăn được yêu thích nhất"
          aria-roledescription="carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="
            relative
            touch-pan-y select-none
            outline-none
          "
        >
          {/* =================================================
           * NÚT PREVIOUS
           * =============================================== */}
          <button
            type="button"
            onClick={handlePrevious}
            aria-label="Xem món ăn trước"
            className="
              absolute left-0 top-1/2 z-20
              flex h-10 w-10
              -translate-x-1/3 -translate-y-1/2
              items-center justify-center
              rounded-full bg-white
              text-tayho-orange
              shadow-md
              transition
              hover:scale-105
              hover:bg-gray-50
              active:scale-95
              md:-left-5
              md:h-11 md:w-11
            "
          >
            <ChevronLeftIcon className="h-6 w-6" strokeWidth={3.5} />
          </button>

          {/* =================================================
           * DANH SÁCH SẢN PHẨM
           * =============================================== */}
          <div
            className="
              mx-auto grid
              max-w-[980px]
              grid-cols-1
              items-center
              gap-6
              px-8
              md:grid-cols-3
              md:px-0
            "
          >
            {/* Sản phẩm bên trái */}
            <div className="hidden md:block">
              <Reveal
                key={`previous-${previousItem.id}-${activeIndex}`}
                type="fade-up"
              >
                <div
                  onClick={handlePrevious}
                  className="
                    cursor-pointer
                    transition duration-300
                    hover:-translate-y-1
                  "
                >
                  <ProductCard item={previousItem} />
                </div>
              </Reveal>
            </div>

            {/* Sản phẩm trung tâm */}
            <Reveal key={`active-${activeItem.id}`} type="fade-up">
              <div
                className="
                  transition duration-300
                  md:scale-[1.03]
                "
              >
                <ProductCard item={activeItem} />
              </div>
            </Reveal>

            {/* Sản phẩm bên phải */}
            <div className="hidden md:block">
              <Reveal key={`next-${nextItem.id}-${activeIndex}`} type="fade-up">
                <div
                  onClick={handleNext}
                  className="
                    cursor-pointer
                    transition duration-300
                    hover:-translate-y-1
                  "
                >
                  <ProductCard item={nextItem} />
                </div>
              </Reveal>
            </div>
          </div>

          {/* =================================================
           * NÚT NEXT
           * =============================================== */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Xem món ăn tiếp theo"
            className="
              absolute right-0 top-1/2 z-20
              flex h-10 w-10
              translate-x-1/3 -translate-y-1/2
              items-center justify-center
              rounded-full bg-white
              text-tayho-orange
              shadow-md
              transition
              hover:scale-105
              hover:bg-gray-50
              active:scale-95
              md:-right-5
              md:h-11 md:w-11
            "
          >
            <ChevronRightIcon className="h-6 w-6" strokeWidth={3.5} />
          </button>
        </div>

        {/* =================================================
         * DOT NAVIGATION
         * =============================================== */}
        <div
          className="
            mt-6 flex
            items-center justify-center
            gap-2
          "
          aria-label="Chọn món ăn"
        >
          {favorites.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Xem món ăn ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "h-2 rounded-full",
                  "transition-all duration-300",

                  isActive
                    ? "w-6 bg-white"
                    : ["w-2 bg-white/50", "hover:bg-white/80"].join(" "),
                ].join(" ")}
              />
            );
          })}
        </div>

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

        {/* Nội dung hỗ trợ trình đọc màn hình */}
        <p className="sr-only" aria-live="polite">
          Đang hiển thị món ăn {activeIndex + 1} trên {favorites.length}
        </p>
      </Container>
    </section>
  );
}
