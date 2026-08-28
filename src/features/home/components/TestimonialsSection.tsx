"use client";

import Image from "next/image";
import { StarIcon } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/shared/Reveal";
import { SwiperCarousel } from "@/components/ui/SwiperCarousel";

import {
  testimonials,
  type TestimonialItem,
} from "../mocks/testimonials.mock";

/**
 * Thời gian tự chuyển đánh giá.
 *
 * 4.000 ms = 4 giây.
 */
const AUTO_PLAY_DELAY = 4_000;

/* =========================================================
 * COMPONENT THẺ ĐÁNH GIÁ
 *
 * Dùng chung 1 kiểu render cho mọi slide — độ nổi bật
 * main/side hoàn toàn do SwiperCarousel xử lý bằng
 * scale/opacity trên .swiper-slide, không tách 2 biến thể.
 * ======================================================= */

/**
 * Tạo chuỗi ngôi sao dựa trên điểm đánh giá.
 *
 * Ví dụ:
 * rating = 4 => ★★★★☆
 */
function getRatingStars(rating: number) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

  return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <article
      className="
        flex
        h-full
        flex-col
        rounded-[20px]
        bg-white
        px-6
        py-6
        text-left
        text-[#626262]
        shadow-soft

        sm:px-7
        sm:py-7

        md:px-8
        md:py-8
      "
    >
      {/* Thông tin người đánh giá */}
      <div className="mb-4 flex items-center gap-3">
        {/* Avatar ký tự */}
        <span
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#2bd67b]
            text-[15px]
            font-black
            text-white
          "
        >
          {item.avatarText}
        </span>

        <div className="min-w-0">
          <p className="truncate text-[13px] font-black uppercase leading-tight text-[#3d3d3d]">
            {item.customerName}
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            <span
              aria-label={`${item.rating} trên 5 sao`}
              className="whitespace-nowrap text-[12px] font-black tracking-[-1px] text-[#ffd000]"
            >
              {getRatingStars(item.rating)}
            </span>

            <span className="whitespace-nowrap text-[12px] font-bold text-[#909090]">
              {item.timeAgo}
            </span>
          </div>
        </div>
      </div>

      {/* Nội dung đánh giá */}
      <p className="text-[14px] leading-[1.7] text-[#555555] sm:text-[15px]">
        {item.content}
      </p>
    </article>
  );
}

/* =========================================================
 * COMPONENT TESTIMONIALS SECTION
 * ======================================================= */

export function TestimonialsSection() {
  return (
    <section
      className="
        flex
        min-h-svh
        flex-col
        justify-center
        bg-[#666665]
        px-3
        pb-14
        pt-24

        text-white

        sm:px-4

        md:px-0
        md:pb-16
        md:pt-28
      "
    >
      <Container className="text-center">
        {/* =================================================
         * TIÊU ĐỀ
         * =============================================== */}
        <Reveal type="fade-up">
          <h2 className="heading-section text-[30px] sm:text-[36px] md:text-[44px]">
            <span className="text-white">Khách hàng</span>{" "}
            <span className="text-[#ffd339]">nói gì</span>{" "}
            <span className="text-green-600">về chúng tôi</span>
          </h2>
        </Reveal>

        {/* =================================================
         * THÔNG TIN GOOGLE REVIEW
         * =============================================== */}
        <Reveal type="fade-up">
          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-2
              gap-y-1

              md:mt-5
            "
          >
            <Image
              src="/images/google-logo.png"
              alt="Google"
              width={64}
              height={22}
              className="h-auto w-[56px] object-contain sm:w-[64px]"
            />

            <StarIcon
              aria-hidden="true"
              className="h-[20px] w-[20px] fill-[#ffd339] text-[#ffd339] sm:h-[22px] sm:w-[22px]"
            />

            <span className="text-[18px] font-black sm:text-[20px]">4.6</span>

            <span className="text-[16px] font-medium text-[#ff9d00] sm:text-[18px]">
              (519 đánh giá)
            </span>
          </div>
        </Reveal>

        {/* =================================================
         * CENTERED TESTIMONIAL CAROUSEL
         *
         * Mobile:  peek nhẹ 2 bên, main ở giữa
         * Tablet:  hiện một phần side card
         * Desktop: [ SIDE ] [ MAIN ] [ SIDE ]
         * =============================================== */}
        <div className="mt-10 md:mt-14">
          <Reveal type="fade-up">
            <SwiperCarousel
              slidesPerView={1.08}
              slidesPerGroup={1}
              spaceBetween={16}
              centeredSlides
              breakpoints={{
                768: {
                  slidesPerView: 1.6,
                  slidesPerGroup: 1,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  slidesPerGroup: 1,
                  spaceBetween: 24,
                },
              }}
              autoplayDelay={AUTO_PLAY_DELAY}
              speed={600}
              rewind
              navigation
              pagination
              className="
                px-12
                text-[#666665]

                sm:px-14

                [--swiper-pagination-bullet-inactive-color:white]
                [--swiper-pagination-bullet-inactive-opacity:0.5]
                [--swiper-pagination-bullet-size:8px]
                [--swiper-pagination-color:#ffd339]

                [&_.swiper-wrapper]:items-stretch
                [&_.swiper-wrapper]:py-3
                [&_.swiper-slide]:!h-auto
                [&_.swiper-slide]:min-w-0
                [&_.swiper-slide]:self-stretch

                [&_.swiper-slide]:transition-[transform,opacity]
                [&_.swiper-slide]:duration-[600ms]
                [&_.swiper-slide]:ease-out

                [&_.swiper-slide:not(.swiper-slide-active)]:scale-[0.85]
                [&_.swiper-slide:not(.swiper-slide-active)]:opacity-60

                [&_.swiper-slide.swiper-slide-active]:scale-100
                [&_.swiper-slide.swiper-slide-active]:opacity-100
                [&_.swiper-slide.swiper-slide-active]:z-10
              "
            >
              {testimonials.map((item) => (
                <TestimonialCard key={item.id} item={item} />
              ))}
            </SwiperCarousel>
          </Reveal>
        </div>

        {/* Nội dung hỗ trợ trình đọc màn hình */}
        <p className="sr-only" aria-live="polite">
          Carousel đánh giá của khách hàng
        </p>
      </Container>
    </section>
  );
}
