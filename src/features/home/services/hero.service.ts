// SERVER-ONLY — chỉ dùng trong Server Component (xem home-section.service.ts).
import type { PublicPageSection } from "@/features/content/public";

import { splitLines, toCta } from "./home-section.service";

/** Phần chữ của TopHero (ảnh nền, khối liên hệ vẫn do TopHero/brand quyết định). */
export type HomeHero = {
  /** Chữ nhỏ phía trên, vd. "Bánh cuốn" — rỗng thì không hiện. */
  eyebrow: string;
  /** Chữ lớn, vd. "TÂY HỒ" (bắt buộc). */
  title: string;
  /** Câu slogan, mỗi phần tử một dòng. */
  description: string[];
  /** Nút chính, khi có cả nhãn lẫn link. */
  cta: { label: string; href: string } | null;
};

/**
 * Ô "hero" của trang chủ: eyebrow, heading = chữ lớn, slogan = nội dung (mỗi dòng một câu) hoặc subheading.
 * null khi thiếu heading — trường bắt buộc — thì trang chủ không hiển thị khối này.
 */
export function toHomeHero(section: PublicPageSection): HomeHero | null {
  if (!section.heading) {
    return null;
  }

  const description = splitLines(section.body);

  return {
    eyebrow: section.eyebrow ?? "",
    title: section.heading,
    description: description.length > 0 ? description : splitLines(section.subheading),
    cta: toCta(section),
  };
}
