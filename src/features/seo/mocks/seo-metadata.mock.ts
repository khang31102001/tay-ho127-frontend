import type { ManagedSeoMetadata } from "../types/seo-metadata.types";

/**
 * MOCK CONTRACT — chỉ seed MỘT VÀI override làm ví dụ (product-bc001 là id
 * mẫu — Product đã đọc từ Backend nên id thật sẽ khác; article-cong-thuc-banh-
 * cuon-truyen-thong xem features/articles/mocks/article.mock.ts). Phần lớn
 * entity CỐ TÌNH không có override, để SEO Dashboard/List thể hiện đúng "gap"
 * (thiếu Meta Title/Description/OG Image) như Task 11 yêu cầu — không phải
 * dữ liệu thiếu sót.
 */
export const SEED_SEO_METADATA: ManagedSeoMetadata[] = [
  {
    id: "seo-meta-product-bc001",
    entityType: "product",
    entityId: "product-bc001",
    metaTitle: "Bánh cuốn nhân thịt Tây Hồ 127 — đặt online giao nhanh",
    metaDescription:
      "Bánh cuốn nhân thịt tráng mỏng, ăn kèm chả lụa và nước mắm gia truyền. Đặt online tại Bánh Cuốn Tây Hồ 127.",
    canonicalUrl: null,
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: null,
    ogDescription: null,
    ogImageMediaId: "media-banh-cuon-dish",
    twitterTitle: null,
    twitterDescription: null,
    twitterImageMediaId: null,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "seo-meta-article-cong-thuc-banh-cuon-truyen-thong",
    entityType: "article",
    entityId: "article-cong-thuc-banh-cuon-truyen-thong",
    metaTitle: null,
    metaDescription: null,
    canonicalUrl: null,
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: null,
    ogDescription: null,
    ogImageMediaId: null,
    twitterTitle: null,
    twitterDescription: null,
    twitterImageMediaId: null,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
  },
];
