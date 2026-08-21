"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Reveal } from "../common/animation";

/* ============================================================
 * TYPES
 * ========================================================== */

type StatItem = {
  value: number;
  suffix?: string;
  label: string;
};

/* ============================================================
 * CONSTANTS
 * ========================================================== */

const stats: StatItem[] = [
  {
    value: 60,
    suffix: "+",
    label: "Năm kinh nghiệm",
  },
  {
    value: 50,
    suffix: "+",
    label: "Món ăn đa dạng",
  },
  {
    value: 5000,
    suffix: "+",
    label: "Khách hàng hài lòng",
  },
  {
    value: 50,
    suffix: "+",
    label: "Đánh giá 5 sao",
  },
];

/* ============================================================
 * COUNT UP
 * ========================================================== */

type CountUpProps = {
  value: number;
  suffix?: string;
  duration?: number;
};

function CountUp({
  value,
  suffix = "",
  duration = 1200,
}: CountUpProps) {
  const elementRef = useRef<HTMLSpanElement>(null);

  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || hasAnimated) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) {
          return;
        }

        setHasAnimated(true);

        const startTime = performance.now();

        function updateCount(currentTime: number) {
          const elapsedTime = currentTime - startTime;

          const progress = Math.min(
            elapsedTime / duration,
            1,
          );

          /*
           * Ease-out cubic:
           * Tăng nhanh ở đầu và giảm tốc ở cuối.
           * Cho cảm giác tự nhiên hơn linear.
           */
          const easedProgress =
            1 - Math.pow(1 - progress, 3);

          const currentValue = Math.round(
            value * easedProgress,
          );

          setDisplayValue(currentValue);

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          }
        }

        requestAnimationFrame(updateCount);
        observer.disconnect();
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [duration, hasAnimated, value]);

  return (
    <span ref={elementRef}>
      {displayValue.toLocaleString("vi-VN")}
      {suffix}
    </span>
  );
}

/* ============================================================
 * COMPONENT
 * ========================================================== */

export function StatsMichelin() {
  return (
    <div className="py-12 text-center md:py-16">
      {/* ======================================================
       * HEADING
       * ==================================================== */}

      <Reveal
        type="fade-up"
        delay={0.05}
      >
        <h2
          className="
            heading-section
            text-[28px]
            text-brand-green
            sm:text-[30px]
            md:text-[34px]
          "
        >
          Hơn 60 năm đồng hành và phục vụ
        </h2>
      </Reveal>

      <Reveal
        type="fade-up"
        delay={0.1}
      >
        <p
          className="
            mt-2
            text-[15px]
            font-medium
            text-black
            md:text-[16px]
          "
        >
          chúng tôi tự hào về chất lượng và sự tin tưởng
          từ khách hàng
        </p>
      </Reveal>

      {/* ======================================================
       * STATISTICS
       * ==================================================== */}

      <div
        className="
          mt-8
          grid grid-cols-2
          gap-x-6 gap-y-8
          md:mt-10
          md:grid-cols-4
          md:gap-8
        "
      >
        {stats.map((item, index) => (
          <Reveal
            key={item.label}
            type="fade-up"
            delay={0.12 + index * 0.06}
          >
            <div>
              <div
                className="
                  font-display
                  text-[42px]
                  font-black
                  leading-none
                  text-brand-green
                  md:text-[48px]
                "
              >
                <CountUp
                  value={item.value}
                  suffix={item.suffix}
                  duration={
                    item.value >= 1000
                      ? 1500
                      : 1000
                  }
                />
              </div>

              <p
                className="
                  mt-3
                  text-[13px]
                  font-medium
                  text-black
                  md:text-[14px]
                "
              >
                {item.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ======================================================
       * MICHELIN
       * ==================================================== */}

      <Reveal
        type="fade-up"
        delay={0.18}
      >
        <div
          className="
            mt-10
            grid items-center
            gap-6
            overflow-visible
            rounded-[22px]
            bg-[#fff2c3]
            px-5 py-7
            text-left

            sm:px-8

            md:mt-14
            md:grid-cols-[300px_1fr]
            md:gap-8
            md:p-0
            md:pr-10
          "
        >
          {/* Michelin Guide */}

          <Image
            src="/images/michelin-guide.png"
            alt="Michelin Guide Ho Chi Minh City"
            width={275}
            height={200}
            className="
              mx-auto
              -mt-10
              w-[230px]
              drop-shadow-2xl

              sm:w-[250px]

              md:-my-8
              md:w-[275px]
            "
          />

          {/* Content */}

          <div
            className="
              flex flex-col
              items-center
              justify-center
              p-2

              md:items-start
              md:p-4
              md:text-left
            "
          >
            <Image
              src="/images/michelin-2026.png"
              alt="Michelin 2026"
              width={110}
              height={110}
              className="
                mb-4
                w-[90px]

                md:mb-5
                md:w-[110px]
              "
            />

            <h3
              className="
                text-center
                text-[19px]
                font-black
                italic
                leading-7
                text-brand-green

                md:text-left
                md:text-[21px]
              "
            >
              Bước chân đầu tiên mang bản sắc dân tộc
              <br className="hidden sm:block" />
              đến nền ẩm thực quốc tế.
            </h3>

            <p
              className="
                mt-4
                text-[14px]
                font-medium
                leading-6
                text-[#34402c]

                md:mt-5
                md:text-[15px]
              "
            >
              Tháng 5/2026 đánh dấu một cột mốc đầy tự
              hào khi Bánh Cuốn Tây Hồ 127 vinh dự được
              trao ngôi sao Michelin đầu tiên, ghi nhận
              hành trình bền bỉ gìn giữ và lan tỏa
              hương vị truyền thống Việt Nam.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}