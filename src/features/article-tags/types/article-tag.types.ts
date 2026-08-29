/**
 * Thẻ (tag) bài viết — tối giản (id/name/slug), không có status/parent.
 * Article giữ tagIds: string[] trực tiếp, KHÔNG có junction table riêng vì
 * quan hệ Article↔Tag không có field phụ nào (khác MenuProduct có
 * priceOverride/sortOrder nên mới cần junction thật). Xem audit Phase 01.
 */
export type ManagedArticleTag = {
  id: string;
  name: string;
  slug: string;
};
