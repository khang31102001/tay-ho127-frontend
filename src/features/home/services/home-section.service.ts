// SERVER-ONLY: dùng chung bộ đọc ô (slot) của features/content/public — chỉ dùng trong Server Component.
import {
  listPageSlots,
  loadMediaById,
  resolveImage,
  splitLines,
  toCta,
  type PageSlot,
  type SlotImage,
} from "@/features/content/public";

export { loadMediaById, resolveImage, splitLines, toCta };

/** Ảnh đã đổi id → URL, sẵn sàng cho next/image. */
export type HomeImage = SlotImage;

/** Một ô (slot) của trang chủ đã có section. */
export type HomeSlot = PageSlot;

/** Mã cố định của trang chủ (Page.pageKey). */
const HOME_PAGE_KEY = "home";

/**
 * Backend chưa có `sectionKey` → nhận diện theo loại như trước, chỉ cho 2 loại trang chủ đã đọc từ Backend.
 * Xóa khi Backend production đã trả `sectionKey`.
 */
const LEGACY_KEY_BY_KIND: Record<string, string> = { story: "story", award: "award" };

/** Các ô của trang chủ theo thứ tự Admin sắp — ô nào không có ở đây thì trang chủ không hiển thị. */
export function listHomeSlots(): Promise<HomeSlot[]> {
  return listPageSlots(HOME_PAGE_KEY, LEGACY_KEY_BY_KIND);
}
