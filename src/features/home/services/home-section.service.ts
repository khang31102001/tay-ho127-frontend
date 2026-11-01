// SERVER-ONLY: gọi Backend qua features/content/public + media công khai — chỉ dùng trong Server Component.
// Import thẳng service media (không qua barrel) — barrel features/media re-export cả UI Admin.
import { listPublishedPageSections, type PublicPageSection } from "@/features/content/public";
import { listMedia } from "@/features/media/services/public-media.service";
import type { ManagedMedia } from "@/features/media/types/media.types";

/** Ảnh đã đổi id → URL, sẵn sàng cho next/image. */
export type HomeImage = {
  src: string;
  alt: string;
};

const HOME_PAGE_SLUG = "/";

/**
 * Section đầu tiên (theo thứ tự) có loại `sectionKind` của page "/" do Admin quản lý; null khi chưa có, page chưa
 * xuất bản hoặc Backend lỗi — nơi gọi dùng nội dung mặc định. Các khối trang chủ cùng gọi trong một lần render chỉ
 * tốn một request: fetch cùng URL được Next.js gộp và cache 60 giây.
 */
export async function findHomeSection(sectionKind: string): Promise<PublicPageSection | null> {
  const sections = await listPublishedPageSections(HOME_PAGE_SLUG);
  return sections?.find((section) => section.sectionKind === sectionKind) ?? null;
}

/** Media công khai theo id — chỉ tải khi section thật sự trỏ tới ảnh nào đó. */
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
  fallback: HomeImage,
): HomeImage {
  const media = mediaId ? mediaById.get(mediaId) : undefined;
  return media ? { src: media.url, alt: media.altText || fallback.alt } : fallback;
}
