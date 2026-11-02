// SERVER-ONLY — chỉ dùng trong Server Component (xem home-section.service.ts).
import type { PublicPageSection } from "@/features/content/public";

import { loadMediaById, resolveImage, splitLines, type HomeImage } from "./home-section.service";

/** 1 ô số liệu: giá trị số chạy từ 0 khi `value` là số, còn lại hiện nguyên `text`. */
export type HomeStatItem = {
  label: string;
  value: number | null;
  suffix: string;
  text: string;
};

/** Phần ảnh hoạt động + tiêu đề + số liệu của ExperienceSection. */
export type HomeStats = {
  /** Tiêu đề xanh, vd. "Hơn 60 năm đồng hành và phục vụ" (bắt buộc). */
  heading: string;
  /** Dòng phụ dưới tiêu đề, mỗi phần tử một dòng. */
  description: string[];
  image: HomeImage;
  items: HomeStatItem[];
};

const DEFAULT_IMAGE: HomeImage = { src: "/images/active-img-1.png", alt: "Ảnh hoạt động Bánh Cuốn Tây Hồ 127" };

/** "60+" → 60 + "+", "5.000+" → 5000 + "+"; không bắt đầu bằng số → không chạy số. */
function toStatItem(label: string, title: string): HomeStatItem {
  const match = /^(\d[\d.,]*)(.*)$/.exec(title.trim());
  const value = match ? Number(match[1].replace(/[.,]/g, "")) : NaN;

  return Number.isFinite(value)
    ? { label, value, suffix: match?.[2]?.trim() ?? "", text: title }
    : { label, value: null, suffix: "", text: title };
}

/**
 * Ô "stats" của trang chủ: heading, body = dòng phụ, ảnh chính = ảnh hoạt động, items = số liệu (label = nhãn,
 * title = giá trị). null khi thiếu heading hoặc không có số liệu nào — trang chủ không hiển thị phần này.
 */
export async function toHomeStats(section: PublicPageSection): Promise<HomeStats | null> {
  const items = section.items.flatMap((item) => (item.label && item.title ? [toStatItem(item.label, item.title)] : []));
  if (!section.heading || items.length === 0) {
    return null;
  }

  const mediaById = await loadMediaById([section.mediaId]);

  return {
    heading: section.heading,
    description: splitLines(section.body),
    image: resolveImage(section.mediaId, mediaById, DEFAULT_IMAGE),
    items,
  };
}
