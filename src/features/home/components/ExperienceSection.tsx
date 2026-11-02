"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Reveal } from "@/shared/components/Reveal";
import { Container } from "@/shared/ui/Container";

import type { HomeAward } from "../services/award.service";
import type { HomeStats } from "../services/stats.service";

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

type ExperienceSectionProps = {
  /** Ảnh hoạt động + tiêu đề + số liệu (ô "stats" của trang chủ) — null thì không hiện phần này. */
  stats: HomeStats | null;
  /** Thẻ MICHELIN (ô "award" của trang chủ) — null thì không hiện thẻ. */
  award: HomeAward | null;
};

/** Hai ô "stats" và "award" dùng chung một khối nền; không còn ô nào có dữ liệu thì không hiện cả khối. */
export function ExperienceSection({ stats, award }: ExperienceSectionProps) {
  if (!stats && !award) {
    return null;
  }

  return (
    <section
      className="
        flex
        min-h-svh
        flex-col
        justify-center
        bg-[#fdf6e8]
        pb-6
        pt-20
        text-brand-ink

        sm:pt-24
        md:pb-8
        md:pt-24
      "
    >
      <Container className="flex flex-col gap-4 sm:gap-6 md:gap-8">
        {stats && (
        <>
        {/* ======================================================
         * ẢNH HOẠT ĐỘNG
         * ==================================================== */}

        <Reveal type="zoom-in">
          <div
            className="
              relative
              aspect-[16/5]
              w-full
              overflow-hidden
              rounded-[22px]
              bg-white

            
            "
          >
            <Image
              src={stats.image.src}
              alt={stats.image.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        </Reveal>

        {/* ======================================================
         * HEADING + STATS
         * ==================================================== */}

        <div className="text-center">
          <Reveal type="fade-up" delay={0.05}>
            <h2 className="heading-section text-[24px] leading-tight text-brand-green">
              {stats.heading}
            </h2>
          </Reveal>

          {stats.description.length > 0 && (
          <Reveal type="fade-up" delay={0.1}>
            <p
              className="
                mt-2
                text-[13px]
                font-medium
                text-black
                md:text-[16px]
              "
            >
              {stats.description.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </Reveal>
          )}

          <div
            className="
              mt-4
              grid grid-cols-2
              gap-x-6 gap-y-3
              md:mt-6
              md:grid-cols-4
              md:gap-8
            "
          >
            {stats.items.map((item, index) => (
              <Reveal
                key={item.label}
                type="fade-up"
                delay={0.12 + index * 0.06}
              >
                <div>
                  <div className="stat-number text-[30px] md:text-[48px]">
                    {item.value === null ? (
                      item.text
                    ) : (
                      <CountUp
                        value={item.value}
                        suffix={item.suffix}
                        duration={
                          item.value >= 1000 ? 1500 : 1000
                        }
                      />
                    )}
                  </div>

                  <p
                    className="
                      mt-2
                      text-[13px]
                      font-medium
                      text-black
                      md:mt-3
                      md:text-[14px]
                    "
                  >
                    {item.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        </>
        )}

        {/* ======================================================
         * MICHELIN
         * ==================================================== */}
        {award && (
<Reveal type="fade-up" delay={0.18}>
  <div
    className="
      relative
      mx-auto
      grid
      w-full
      max-w-[300px]
      items-center
      gap-6
      overflow-visible
      rounded-[22px]
  
       bg-[url('/images/bg-statsmichelin.png')]
      bg-cover
      bg-center
      bg-no-repeat
      px-5 py-4
      text-center

      sm:max-w-none
      sm:px-6
      sm:py-6

      md:grid-cols-[300px_1fr]
      md:gap-8
      md:p-0
      md:pr-10

      lg:max-w-[940px]
    "
  >
    {/* Michelin Guide book — ẩn ở mobile, hiện từ sm trở lên */}

    <Image
      src={award.images.feature.src}
      alt={award.images.feature.alt}
      width={275}
      height={200}
      className="
        hidden

        sm:mx-auto
        sm:block
        sm:w-[220px]
        sm:self-center
        sm:drop-shadow-2xl

        md:w-[275px]
      "
    />

    {/* Content */}

    <div
      className="
        flex
        flex-col
        items-center
        text-center

        md:p-3
      "
    >
      <Image
        src={award.images.badge.src}
        alt={award.images.badge.alt}
        width={110}
        height={110}
        className="
          mb-2
          w-[64px]

          md:mb-3
          md:w-[90px]
        "
      />

      {award.heading && (
        <h3
          className="
            text-[16px]
            font-black
            italic
            leading-[1.3]
            text-brand-green
            w-full
            text-center
            md:text-[19px]
            md:leading-6
          "
        >
          {award.heading}
        </h3>
      )}

      {award.description && (
        <p
          className="
            mt-2
            line-clamp-3
            text-[12px]
            font-medium
            leading-[1.35]
            text-[#34402c]
            text-justify
            md:mt-3
            md:line-clamp-4
            md:text-[14px]
            md:leading-[1.45]
          "
        >
          {award.description}
        </p>
      )}
      {award.cta && (
        <Link
          href={award.cta.href}
          className="focus-ring mt-2 inline-flex items-center text-[13px] font-bold text-brand-red underline-offset-4 hover:underline md:mt-3 md:text-[14px]"
        >
          {award.cta.label}
        </Link>
      )}
    </div>
  </div>
</Reveal>
        )}

      </Container>
    </section>
  );
}