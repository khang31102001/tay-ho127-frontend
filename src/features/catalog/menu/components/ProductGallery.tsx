"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

import { cn } from "@/core/utils/cn";
import { ProtectedProductImage } from "./ProtectedProductImage";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  /** Nhãn danh mục đè góc trên-trái ảnh lớn. */
  badge?: ReactNode;
};

/**
 * Ảnh trang chi tiết món. 1 ảnh → khung ảnh đơn; >= 2 ảnh → ảnh lớn + mũi tên + dải
 * thumbnail (mobile vuốt ngang dải thumbnail, desktop bấm thumbnail/mũi tên).
 */
export function ProductGallery({ images, alt, badge }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = images.length;
  const hasMany = total > 1;
  const current = images[Math.min(activeIndex, total - 1)];

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + total) % total);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % total);
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-card border border-brand-line bg-white shadow-soft">
        <ProtectedProductImage
          key={current}
          src={current}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority={activeIndex === 0}
          logoClassName="w-[22%]"
        />

        {badge}

        {hasMany && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Ảnh trước"
              className="focus-ring absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-ink shadow-soft transition hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Ảnh sau"
              className="focus-ring absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-ink shadow-soft transition hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 left-3 z-10 rounded bg-black/55 px-2 py-0.5 text-xs font-bold text-white">
              {activeIndex + 1} / {total}
            </span>
          </>
        )}
      </div>

      {hasMany && (
        <ul
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          aria-label="Danh sách ảnh"
          onContextMenu={(event) => event.preventDefault()}
        >
          {images.map((url, index) => (
            <li key={`${url}-${index}`} className="w-16 shrink-0 sm:w-20">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Xem ảnh ${index + 1}`}
                aria-current={index === activeIndex}
                className={cn(
                  "focus-ring relative block aspect-square w-full overflow-hidden rounded-md border-2 transition",
                  index === activeIndex ? "border-brand-red" : "border-brand-line opacity-80 hover:opacity-100",
                )}
              >
                <Image src={url} alt="" fill sizes="80px" className="object-cover" draggable={false} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
