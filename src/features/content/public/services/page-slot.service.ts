// SERVER-ONLY: gọi Backend (section công khai + media công khai) — chỉ dùng trong Server Component.
// Import thẳng service media (không qua barrel) — barrel features/media re-export cả UI Admin.
import { listMedia } from "@/features/media/services/public-media.service";
import type { ManagedMedia } from "@/features/media/types/media.types";

import type { PublicPageSection } from "../types/public-content.types";
import { listPublishedPageSections } from "./public-content.service";

/**
 * Trang Site = các ô (slot) theo thứ tự Admin sắp (Admin → Nội dung → Trang → Sections). Mỗi trang khai báo ô của
 * mình cho Admin ở features/content/page-sections/types/page-templates.ts và tự map key → component.
 * Đề xuất: document/04-nghiep-vu/de-xuat/QUAN-LY-SECTION-TRANG.md.
 */
export type PageSlot = {
  key: string;
  section: PublicPageSection;
};

/** Ảnh đã đổi id → URL, sẵn sàng cho next/image. */
export type SlotImage = {
  src: string;
  alt: string;
};

export type SlotLink = {
  label: string;
  href: string;
};

/** Nội dung 1 ô đã làm sạch cho component: chuỗi rỗng = Admin bỏ trống, `image` null = chưa chọn ảnh. */
export type SlotContent = {
  eyebrow: string;
  heading: string;
  subheading: string;
  /** Nội dung tách đoạn bằng dòng trống. */
  paragraphs: string[];
  /** Nội dung tách theo từng dòng (danh sách ý, slogan nhiều dòng). */
  lines: string[];
  image: SlotImage | null;
  cta: SlotLink | null;
  items: { label: string; title: string; text: string; url: string; image: SlotImage | null }[];
};

/**
 * Các ô của trang `pageKey` ("home", "gioi-thieu"...) theo thứ tự Admin sắp. Section ẩn (Backend không trả), section
 * tự do (không key) và key trùng (giữ cái đầu) bị bỏ. Rỗng khi trang chưa có / chưa xuất bản.
 * `legacyKeyByKind`: nhận diện theo loại khi Backend chưa trả `sectionKey` (bản trước migration AddPageSectionKey).
 */
export async function listPageSlots(pageKey: string, legacyKeyByKind: Record<string, string> = {}): Promise<PageSlot[]> {
  const sections = (await listPublishedPageSections(pageKey)) ?? [];
  const seenKeys = new Set<string>();

  return sections.flatMap((section) => {
    const key = section.sectionKey ?? legacyKeyByKind[section.sectionKind];
    if (!key || seenKeys.has(key)) {
      return [];
    }

    seenKeys.add(key);
    return [{ key, section }];
  });
}

/**
 * Thứ tự render: các ô theo thứ tự Admin, rồi tới khối lõi (nội dung chính của trang, luôn hiển thị) chưa có section
 * — để trang không bao giờ mất phần chính chỉ vì thiếu 1 dòng dữ liệu.
 */
export function orderBlockKeys(slots: PageSlot[], coreKeys: string[] = []): string[] {
  const keys = slots.map((slot) => slot.key);
  return [...keys, ...coreKeys.filter((key) => !keys.includes(key))];
}

/** Media công khai theo id — chỉ tải khi có section thật sự trỏ tới ảnh nào đó. */
export async function loadMediaById(mediaIds: (string | null | undefined)[]): Promise<Map<string, ManagedMedia>> {
  if (!mediaIds.some(Boolean)) {
    return new Map();
  }

  return new Map((await listMedia()).map((media) => [media.id, media]));
}

/** Ảnh không tìm thấy (id sai, media đã tắt, host chưa khai báo) → giữ ảnh mặc định của vị trí đó. */
export function resolveImage(
  mediaId: string | null | undefined,
  mediaById: Map<string, ManagedMedia>,
  fallback: SlotImage,
): SlotImage {
  const media = mediaId ? mediaById.get(mediaId) : undefined;
  return media ? { src: media.url, alt: media.altText || fallback.alt } : fallback;
}

function findImage(mediaId: string | null, mediaById: Map<string, ManagedMedia>): SlotImage | null {
  const media = mediaId ? mediaById.get(mediaId) : undefined;
  return media ? { src: media.url, alt: media.altText ?? "" } : null;
}

/** CTA chỉ có khi đủ cả nhãn lẫn link. */
export function toCta(section: PublicPageSection): SlotLink | null {
  return section.ctaLabel && section.ctaUrl ? { label: section.ctaLabel, href: section.ctaUrl } : null;
}

/** Văn bản thuần → các dòng không rỗng. */
export function splitLines(text: string | null): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Văn bản thuần → các đoạn (cách nhau bằng dòng trống). */
export function splitParagraphs(text: string | null): string[] {
  return (text ?? "")
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Nội dung từng ô theo key (ảnh của mọi ô tải trong 1 lần). */
export async function loadSlotContents(slots: PageSlot[]): Promise<Map<string, SlotContent>> {
  const mediaById = await loadMediaById(
    slots.flatMap(({ section }) => [section.mediaId, ...section.items.map((item) => item.mediaId)]),
  );

  return new Map(
    slots.map(({ key, section }) => [
      key,
      {
        eyebrow: section.eyebrow ?? "",
        heading: section.heading ?? "",
        subheading: section.subheading ?? "",
        paragraphs: splitParagraphs(section.body),
        lines: splitLines(section.body),
        image: findImage(section.mediaId, mediaById),
        cta: toCta(section),
        items: section.items.map((item) => ({
          label: item.label ?? "",
          title: item.title ?? "",
          text: item.text ?? "",
          url: item.url ?? "",
          image: findImage(item.mediaId, mediaById),
        })),
      },
    ]),
  );
}
