/**
 * "product"/"category"/"article" đã có Editor gắn tab SEO (Phase hiện tại).
 * "page" (CMS Page) và "homepage" (trang chủ) đã có chỗ trong dữ liệu/route
 * chuẩn bị sẵn nhưng CHƯA có UI join ở SEO List/Editor — Site cũng chưa có
 * route public cho CMS Page, xem seo-architecture-analysis.md mục 2.7/8.4.
 */
export type SeoEntityType = "product" | "category" | "article" | "page" | "homepage";

/**
 * Override SEO cho 1 entity — mọi field (trừ id/entityType/entityId/robots/
 * timestamps) đều nullable theo đúng thiết kế fallback: null = chưa cấu hình,
 * SEO Resolver tự lấy Entity Default rồi tới SeoSettings (xem resolveSeoPreview
 * trong hooks/useSeoEditor.ts). Không có meta_keywords (không có business
 * requirement rõ ràng cho field này).
 */
export type ManagedSeoMetadata = {
  id: string;
  entityType: SeoEntityType;
  /** null chỉ khi entityType = "homepage" (singleton, không có id riêng). */
  entityId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  /** Tham chiếu ManagedMedia.id, chọn từ Media Library. */
  ogImageMediaId: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageMediaId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SeoMetadataFormValue = Omit<
  ManagedSeoMetadata,
  "id" | "entityType" | "entityId" | "createdAt" | "updatedAt"
>;

export const EMPTY_SEO_METADATA_FORM: SeoMetadataFormValue = {
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
};
