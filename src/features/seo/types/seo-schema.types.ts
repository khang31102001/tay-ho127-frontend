import type { SeoEntityType } from "./seo-metadata.types";

/**
 * Open/extensible list (Task 6) — thêm Schema Type mới chỉ cần thêm 1 value ở
 * đây + 1 generator function trong utils/schema-generators.ts, không phải sửa
 * lại kiến trúc. "Offer" thường được generate LỒNG trong Product (schema.org
 * convention), không phải type đứng riêng — giữ trong union để có thể addressable
 * khi cần override riêng sau này.
 */
export type SeoSchemaType =
  | "Organization"
  | "LocalBusiness"
  | "Restaurant"
  | "WebSite"
  | "WebPage"
  | "Product"
  | "BreadcrumbList"
  | "FAQPage"
  | "Article"
  | "Offer";

/**
 * Cấu hình/override Schema.org cho 1 entity (Task 6-10). KHÔNG lưu lại toàn
 * bộ nội dung schema — chỉ lưu phần KHÔNG derive được từ chính entity data
 * (vd. Product không có field sku/brand) trong `config`, hoặc toàn bộ JSON-LD
 * thủ công trong `customJsonLd` khi Admin bật Advanced Mode (Task 10).
 */
export type ManagedSeoSchema = {
  id: string;
  entityType: SeoEntityType;
  entityId: string | null;
  schemaType: SeoSchemaType;
  /** Field phụ không có trên entity gốc — hình dạng tuỳ schemaType (vd. Product: { sku?, brand? }). */
  config: Record<string, string> | null;
  /** Advanced Mode: JSON-LD thủ công, chỉ dùng khi isCustomOverride=true. Đã validate JSON hợp lệ trước khi lưu. */
  customJsonLd: string | null;
  isCustomOverride: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SeoSchemaFormValue = Pick<ManagedSeoSchema, "config" | "customJsonLd" | "isCustomOverride" | "isActive">;

export const EMPTY_SEO_SCHEMA_FORM: SeoSchemaFormValue = {
  config: null,
  customJsonLd: null,
  isCustomOverride: false,
  isActive: true,
};
