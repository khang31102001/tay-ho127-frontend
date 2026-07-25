"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from "lucide-react";

import { Container } from "../ui/Container";
import { Reveal } from "../common/animation";

import {
  testimonials,
  type TestimonialItem,
} from "@/data/testimonials";

/**
 * Thời gian tự chuyển đánh giá.
 *
 * 5.000 ms = 5 giây.
 */
const AUTO_PLAY_DELAY = 5_000;

/**
 * Khoảng cách vuốt tối thiểu để chuyển slide.
 *
 * Nếu vuốt nhỏ hơn 50px thì không chuyển.
 */
const SWIPE_THRESHOLD = 50;

/* =========================================================
 * COMPONENT THẺ ĐÁNH GIÁ
 * ======================================================= */

interface TestimonialCardProps {
  item: TestimonialItem;
  variant?: "main" | "side";
  onClick?: () => void;
}

/**
 * Tạo chuỗi ngôi sao dựa trên điểm đánh giá.
 *
 * Ví dụ:
 * rating = 4 => ★★★★☆
 */
function getRatingStars(rating: number) {
  const safeRating = Math.max(
    0,
    Math.min(5, Math.round(rating)),
  );

  return `${"★".repeat(safeRating)}${"☆".repeat(
    5 - safeRating,
  )}`;
}

function TestimonialCard({
  item,
  variant = "main",
  onClick,
}: TestimonialCardProps) {
  const isMainCard = variant === "main";

  return (
    <article
      onClick={onClick}
      className={[
        "bg-white text-left text-[#626262]",
        "shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
        "transition duration-300",

        isMainCard
          ? [
              "min-h-[144px] rounded-[15px]",
              "px-6 py-5",
            ].join(" ")
          : [
              "hidden h-[108px] cursor-pointer",
              "overflow-hidden rounded-[15px]",
              "px-4 py-4 opacity-90",
              "hover:-translate-y-1",
              "hover:opacity-100",
              "md:block",
            ].join(" "),
      ].join(" ")}
    >
      {/* Thông tin người đánh giá */}
      <div
        className={[
          "flex items-center gap-3",
          isMainCard ? "mb-3" : "mb-2",
        ].join(" ")}
      >
        {/* Avatar ký tự */}
        <span
          className={[
            "flex shrink-0 items-center justify-center",
            "rounded-full bg-[#2bd67b]",
            "font-black text-white",

            isMainCard
              ? "h-[25px] w-[25px] text-[11px]"
              : "h-[22px] w-[22px] text-[9px]",
          ].join(" ")}
        >
          {item.avatarText}
        </span>

        <div className="min-w-0">
          <p
            className={[
              "truncate font-black uppercase",
              "leading-tight text-[#3d3d3d]",

              isMainCard
                ? "text-[10px]"
                : "text-[9px]",
            ].join(" ")}
          >
            {item.customerName}
          </p>

          <div className="mt-1 flex items-center gap-1">
            <span
              aria-label={`${item.rating} trên 5 sao`}
              className={[
                "whitespace-nowrap font-black",
                "tracking-[-1px] text-[#ffd000]",

                isMainCard
                  ? "text-[8px]"
                  : "text-[7px]",
              ].join(" ")}
            >
              {getRatingStars(item.rating)}
            </span>

            <span
              className={[
                "whitespace-nowrap font-bold",
                "text-[#909090]",

                isMainCard
                  ? "text-[8px]"
                  : "text-[7px]",
              ].join(" ")}
            >
              {item.timeAgo}
            </span>
          </div>
        </div>
      </div>

      {/* Nội dung đánh giá */}
      <p
        className={[
          "text-[#777777]",

          isMainCard
            ? "text-[10px] leading-[1.55]"
            : "line-clamp-3 text-[8px] leading-[1.5]",
        ].join(" ")}
      >
        {item.content}
      </p>
    </article>
  );
}

/* =========================================================
 * COMPONENT TESTIMONIALS
 * ======================================================= */

export function Testimonials() {
  /**
   * Index của đánh giá đang hiển thị ở trung tâm.
   */
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * Khi người dùng rê chuột vào carousel,
   * autoplay sẽ tạm dừng.
   */
  const [isPaused, setIsPaused] = useState(false);

  /**
   * Lưu vị trí bắt đầu chạm khi vuốt trên mobile.
   */
  const touchStartXRef = useRef<number | null>(null);

  /**
   * Lấy index trước đó.
   *
   * Khi activeIndex = 0 thì slide trước là phần tử cuối.
   */
  const previousIndex =
    activeIndex === 0
      ? testimonials.length - 1
      : activeIndex - 1;

  /**
   * Lấy index tiếp theo.
   *
   * Khi đang ở phần tử cuối thì quay về phần tử đầu.
   */
  const nextIndex =
    activeIndex === testimonials.length - 1
      ? 0
      : activeIndex + 1;

  /**
   * Chuyển sang đánh giá tiếp theo.
   */
  const handleNext = useCallback(() => {
    setActiveIndex((currentIndex) => {
      return currentIndex === testimonials.length - 1
        ? 0
        : currentIndex + 1;
    });
  }, []);

  /**
   * Chuyển sang đánh giá trước đó.
   */
  const handlePrevious = useCallback(() => {
    setActiveIndex((currentIndex) => {
      return currentIndex === 0
        ? testimonials.length - 1
        : currentIndex - 1;
    });
  }, []);

  /**
   * Tự động chuyển slide sau mỗi 5 giây.
   *
   * Khi người dùng rê chuột vào carousel:
   * isPaused = true => không chạy autoplay.
   */
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      handleNext();
    }, AUTO_PLAY_DELAY);

    return () => {
      window.clearInterval(timer);
    };
  }, [handleNext, isPaused]);

  /**
   * Xử lý phím mũi tên:
   * - ArrowLeft: slide trước.
   * - ArrowRight: slide tiếp theo.
   */
  function handleKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
  ) {
    if (event.key === "ArrowLeft") {
      handlePrevious();
    }

    if (event.key === "ArrowRight") {
      handleNext();
    }
  }

  /**
   * Ghi nhận vị trí khi bắt đầu vuốt.
   */
  function handleTouchStart(
    event: TouchEvent<HTMLDivElement>,
  ) {
    touchStartXRef.current =
      event.touches[0]?.clientX ?? null;
  }

  /**
   * Xử lý khi người dùng kết thúc thao tác vuốt.
   */
  function handleTouchEnd(
    event: TouchEvent<HTMLDivElement>,
  ) {
    if (touchStartXRef.current === null) {
      return;
    }

    const touchEndX =
      event.changedTouches[0]?.clientX;

    if (touchEndX === undefined) {
      return;
    }

    const swipeDistance =
      touchEndX - touchStartXRef.current;

    /**
     * Vuốt sang trái:
     * chuyển sang slide tiếp theo.
     */
    if (swipeDistance < -SWIPE_THRESHOLD) {
      handleNext();
    }

    /**
     * Vuốt sang phải:
     * chuyển về slide trước.
     */
    if (swipeDistance > SWIPE_THRESHOLD) {
      handlePrevious();
    }

    touchStartXRef.current = null;
  }

  const activeItem = testimonials[activeIndex];
  const previousItem = testimonials[previousIndex];
  const nextItem = testimonials[nextIndex];

  return (
    <section
      className="
        snap-start snap-always
        bg-[#666665]
        py-6 text-white
        md:min-h-[270px]
      "
    >
      <Container className="text-center">
        {/* =================================================
         * TIÊU ĐỀ
         * =============================================== */}
        <Reveal type="fade-up">
          <h2 className="heading-section text-[24px] font-black leading-tight md:text-[26px]">
            Khách hàng{" "}
            <span className="text-[#ffd339]">
              nói gì
            </span>{" "}
            về chúng tôi
          </h2>
        </Reveal>

        {/* =================================================
         * THÔNG TIN GOOGLE REVIEW
         * =============================================== */}
        <Reveal type="fade-up">
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <Image
              src="/images/google-logo.png"
              alt="Google"
              width={52}
              height={18}
              className="h-auto w-[52px] object-contain"
            />

            <StarIcon
              aria-hidden="true"
              className="
                h-[18px] w-[18px]
                fill-[#ffd339] text-[#ffd339]
              "
            />

            <span className="text-[16px] font-black">
              4.6
            </span>

            <span className="text-[16px] font-medium text-[#ff9d00]">
              (519 đánh giá)
            </span>
          </div>
        </Reveal>

        {/* =================================================
         * CAROUSEL
         * =============================================== */}
        <div
          role="region"
          aria-label="Đánh giá của khách hàng"
          aria-roledescription="carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="
            mx-auto mt-6 grid max-w-[720px]
            touch-pan-y select-none
            grid-cols-[34px_minmax(0,226px)_34px]
            items-center justify-center gap-4
            outline-none
            md:mt-7
            md:grid-cols-[34px_170px_226px_170px_34px]
            md:gap-[18px]
          "
        >
          {/* Nút quay lại */}
          <button
            type="button"
            onClick={handlePrevious}
            aria-label="Xem đánh giá trước"
            className="
              flex h-[32px] w-[32px]
              items-center justify-center
              rounded-full bg-white
              text-[#666665]
              shadow-sm transition
              hover:scale-105 hover:bg-gray-100
              active:scale-95
            "
          >
            <ChevronLeftIcon
              className="h-[22px] w-[22px]"
              strokeWidth={3.5}
            />
          </button>

          {/* Thẻ bên trái */}
          <Reveal
            key={`previous-${previousItem.id}-${activeIndex}`}
            type="fade-up"
          >
            <TestimonialCard
              item={previousItem}
              variant="side"
              onClick={handlePrevious}
            />
          </Reveal>

          {/* Thẻ chính */}
          <Reveal
            key={`active-${activeItem.id}`}
            type="fade-up"
          >
            <TestimonialCard
              item={activeItem}
              variant="main"
            />
          </Reveal>

          {/* Thẻ bên phải */}
          <Reveal
            key={`next-${nextItem.id}-${activeIndex}`}
            type="fade-up"
          >
            <TestimonialCard
              item={nextItem}
              variant="side"
              onClick={handleNext}
            />
          </Reveal>

          {/* Nút tiếp theo */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Xem đánh giá tiếp theo"
            className="
              flex h-[32px] w-[32px]
              items-center justify-center
              rounded-full bg-white
              text-[#666665]
              shadow-sm transition
              hover:scale-105 hover:bg-gray-100
              active:scale-95
            "
          >
            <ChevronRightIcon
              className="h-[22px] w-[22px]"
              strokeWidth={3.5}
            />
          </button>
        </div>

        {/* =================================================
         * DOT NAVIGATION
         * =============================================== */}
        <div
          className="mt-5 flex items-center justify-center gap-2"
          aria-label="Chọn đánh giá"
        >
          {testimonials.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Xem đánh giá ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "h-2 rounded-full transition-all duration-300",

                  isActive
                    ? "w-6 bg-[#ffd339]"
                    : "w-2 bg-white/50 hover:bg-white/80",
                ].join(" ")}
              />
            );
          })}
        </div>

        {/* Nội dung hỗ trợ trình đọc màn hình */}
        <p className="sr-only" aria-live="polite">
          Đang hiển thị đánh giá {activeIndex + 1} trên{" "}
          {testimonials.length}
        </p>
      </Container>
    </section>
  );
}