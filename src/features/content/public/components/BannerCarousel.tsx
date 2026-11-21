"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/core/utils/cn";

/** Banner đã đổi id media → URL, sẵn sàng cho next/image. */
export type BannerSlide = {
  id: string;
  desktopSrc: string;
  /** Không có ảnh mobile thì dùng ảnh desktop. */
  mobileSrc: string | null;
  alt: string;
  heading: string | null;
  subheading: string | null;
  cta: { label: string; href: string } | null;
};

type BannerCarouselProps = {
  slides: BannerSlide[];
  /** Hiện heading/subheading/CTA đè lên ảnh (ảnh ưu đãi đã có sẵn chữ thì tắt). */
  showText: boolean;
  /** Chiều cao khung: "screen" = cả màn hình (dải ưu đãi), "banner" = dải banner thường. */
  size: "screen" | "banner";
  autoplayMs?: number;
};

const AUTOPLAY_DEFAULT_MS = 6000;

/** Nhiều banner → chuyển tự động + chấm điều hướng; một banner → ảnh tĩnh. */
export function BannerCarousel({ slides, showText, size, autoplayMs = AUTOPLAY_DEFAULT_MS }: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = slides.length;

  useEffect(() => {
    if (total < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % total), autoplayMs);
    return () => window.clearInterval(timer);
  }, [total, autoplayMs]);

  return (
    <section className={cn("relative overflow-hidden", size === "screen" ? "min-h-svh" : "aspect-[16/7] min-h-[220px]")}>
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={cn("absolute inset-0 transition-opacity duration-700", isActive ? "opacity-100" : "pointer-events-none opacity-0")}
          >
            {slide.mobileSrc && (
              <Image src={slide.mobileSrc} alt={slide.alt} fill sizes="100vw" priority={index === 0} className="object-cover md:hidden" />
            )}
            <Image
              src={slide.desktopSrc}
              alt={slide.alt}
              fill
              sizes="100vw"
              priority={index === 0}
              className={cn("object-cover", slide.mobileSrc && "hidden md:block")}
            />

            {showText && (slide.heading || slide.subheading || slide.cta) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-6 pb-10 pt-24 text-white sm:px-12">
                {slide.heading && <h2 className="text-2xl font-black sm:text-4xl">{slide.heading}</h2>}
                {slide.subheading && <p className="mt-2 max-w-2xl text-base sm:text-lg">{slide.subheading}</p>}
                {slide.cta && (
                  <Link
                    href={slide.cta.href}
                    tabIndex={isActive ? 0 : -1}
                    className="mt-4 inline-flex rounded-full bg-brand-red px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    {slide.cta.label}
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}

      {total > 1 && (
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Xem banner ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn("size-2.5 rounded-full border border-white/80 transition", index === activeIndex ? "bg-white" : "bg-white/30")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
