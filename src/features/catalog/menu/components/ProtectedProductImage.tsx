"use client";

import { forwardRef, type ComponentPropsWithoutRef, type SyntheticEvent } from "react";
import Image from "next/image";

import { site } from "@/core/config/site-data";
import { cn } from "@/core/utils/cn";

type ProtectedProductImageProps = ComponentPropsWithoutRef<typeof Image> & {
  /** Kích thước logo đóng dấu (Tailwind width) — card hẹp truyền nhỏ hơn mặc định. */
  logoClassName?: string;
};

function preventSaveImage(event: SyntheticEvent) {
  event.preventDefault();
}

/**
 * Ảnh món có logo quán đóng dấu + chặn tải thông thường (chuột phải, kéo-thả,
 * nhấn giữ "Lưu ảnh" trên mobile). Chỉ là lớp cản phía FE: ảnh vẫn lấy được
 * qua chụp màn hình / DevTools — muốn chống thật phải đóng dấu cứng vào file
 * lúc upload (Backend Media).
 *
 * Render `absolute inset-0` nên phần tử cha phải `relative` + có kích thước
 * (Link/khung aspect của các card). Lớp phủ trong suốt nằm trên ảnh để chuột
 * phải/nhấn giữ trúng lớp phủ chứ không trúng <img>; click vẫn nổi bọt lên
 * Link cha. Vì lớp phủ che ảnh, hiệu ứng hover của ảnh phải dùng `group-hover:`.
 */
export const ProtectedProductImage = forwardRef<HTMLImageElement, ProtectedProductImageProps>(
  function ProtectedProductImage({ className, logoClassName = "w-[26%]", alt, ...imageProps }, ref) {
    return (
      <span
        className="group absolute inset-0 block select-none overflow-hidden [-webkit-touch-callout:none]"
        onContextMenu={preventSaveImage}
        onDragStart={preventSaveImage}
      >
        <Image
          {...imageProps}
          ref={ref}
          alt={alt}
          draggable={false}
          className={cn("pointer-events-none", className)}
        />

        <Image
          src={site.assets.logoWhite}
          alt=""
          aria-hidden
          width={260}
          height={116}
          draggable={false}
          className={cn(
            "pointer-events-none absolute bottom-[4%] right-[4%] h-auto opacity-90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]",
            logoClassName,
          )}
        />

        <span aria-hidden className="absolute inset-0" />
      </span>
    );
  },
);
