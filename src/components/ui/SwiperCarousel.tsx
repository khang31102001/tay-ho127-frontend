"use client";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Children, useId, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from "swiper/modules";
import type { SwiperOptions } from "swiper/types";

type SwiperCarouselProps = {
  children: ReactNode;
  slidesPerView?: number;
  slidesPerGroup?: number;
  spaceBetween?: number;
  breakpoints?: SwiperOptions["breakpoints"];
  autoplayDelay?: number;
  loop?: boolean;
  /**
   * Nhảy về slide đầu khi hết slide cuối (và ngược lại) thay vì loop
   * thật (nhân bản slide). Dùng khi `loop` kết hợp `centeredSlides`
   * cho kết quả không ổn định — rewind vẫn tạo cảm giác cuộn vô hạn
   * nhưng không cần cơ chế clone nên tránh được các lỗi active/isEnd
   * lệch vị trí của Swiper trong tổ hợp đó.
   */
  rewind?: boolean;
  speed?: number;
  navigation?: boolean;
  pagination?: boolean;
  /** Căn giữa slide active thay vì bám mép trái — dùng cho carousel kiểu "focal point ở giữa". */
  centeredSlides?: boolean;
  /**
   * Số slide nhân bản thêm ở mỗi đầu track khi loop (mặc định Swiper
   * chỉ tạo đủ mức tối thiểu). Với `centeredSlides`, mức tối thiểu đó
   * không đủ khiến class `.swiper-slide-active` gán lệch 1 vị trí so
   * với slide thực sự nằm giữa viewport — cần tăng giá trị này (>=
   * slidesPerView) để active/prev/next bám đúng vị trí hình học.
   */
  loopAdditionalSlides?: number;
  /**
   * Chừa khoảng trống trước slide đầu tiên (px). Dùng khi nội dung
   * slide có phần tử tràn ra ngoài mép trái (ví dụ ribbon/badge âm
   * offset) để không bị `.swiper` (overflow: hidden) cắt mất — an
   * toàn hơn padding CSS vì Swiper tự tính vào layout/translate.
   */
  slidesOffsetBefore?: number;
  /** Chừa khoảng trống sau slide cuối cùng (px), tương tự slidesOffsetBefore. */
  slidesOffsetAfter?: number;
  className?: string;
};

/**
 * UI carousel dùng chung, bọc Swiper để các section không cần biết
 * chi tiết khởi tạo/điều hướng — chỉ truyền config và danh sách item.
 */
export function SwiperCarousel({
  children,
  slidesPerView = 1,
  slidesPerGroup = 1,
  spaceBetween = 24,
  breakpoints,
  autoplayDelay,
  loop = false,
  rewind = false,
  speed = 500,
  navigation = false,
  pagination = false,
  centeredSlides = false,
  loopAdditionalSlides,
  slidesOffsetBefore,
  slidesOffsetAfter,
  className = "",
}: SwiperCarouselProps) {
  /**
   * Nút prev/next và khối pagination nằm ngoài <Swiper>, nên trỏ bằng
   * class selector duy nhất thay vì DOM ref — tránh race condition
   * lúc mount (ref của element render sau <Swiper> vẫn null khi
   * Swiper khởi tạo lần đầu).
   */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const prevClass = `swiper-prev-${uid}`;
  const nextClass = `swiper-next-${uid}`;
  const paginationClass = `swiper-pagination-${uid}`;

  return (
    <div className={`relative ${className}`}>
      <Swiper
        modules={[Navigation, Autoplay, Pagination, Keyboard, A11y]}
        slidesPerView={slidesPerView}
        slidesPerGroup={slidesPerGroup}
        spaceBetween={spaceBetween}
        breakpoints={breakpoints}
        loop={loop}
        rewind={rewind}
        speed={speed}
        centeredSlides={centeredSlides}
        loopAdditionalSlides={loopAdditionalSlides}
        slidesOffsetBefore={slidesOffsetBefore}
        slidesOffsetAfter={slidesOffsetAfter}
        keyboard={{ enabled: true }}
        a11y={{
          prevSlideMessage: "Xem mục trước",
          nextSlideMessage: "Xem mục tiếp theo",
          paginationBulletMessage: "Đi tới mục {{index}}",
        }}
        autoplay={
          autoplayDelay
            ? { delay: autoplayDelay, disableOnInteraction: false }
            : false
        }
        navigation={
          navigation ? { prevEl: `.${prevClass}`, nextEl: `.${nextClass}` } : false
        }
        pagination={
          pagination ? { el: `.${paginationClass}`, clickable: true } : false
        }
      >
        {Children.map(children, (child, index) => (
          <SwiperSlide key={index}>{child}</SwiperSlide>
        ))}
      </Swiper>

      {navigation && (
        <>
          <button
            type="button"
            aria-label="Xem mục trước"
            className={`
              ${prevClass}
              absolute left-0 top-1/2 z-10
              flex h-10 w-10
              -translate-y-1/2
              items-center justify-center
              rounded-full bg-white
              text-current
              shadow-md
              transition
              hover:scale-105
              hover:bg-gray-50
              active:scale-95
              md:h-11 md:w-11
            `}
          >
            <ChevronLeftIcon className="h-6 w-6" strokeWidth={3.5} />
          </button>

          <button
            type="button"
            aria-label="Xem mục tiếp theo"
            className={`
              ${nextClass}
              absolute right-0 top-1/2 z-10
              flex h-10 w-10
              -translate-y-1/2
              items-center justify-center
              rounded-full bg-white
              text-current
              shadow-md
              transition
              hover:scale-105
              hover:bg-gray-50
              active:scale-95
              md:h-11 md:w-11
            `}
          >
            <ChevronRightIcon className="h-6 w-6" strokeWidth={3.5} />
          </button>
        </>
      )}

      {pagination && (
        <div
          className={`${paginationClass} mt-6 flex flex-wrap items-center justify-center gap-2`}
        />
      )}
    </div>
  );
}
