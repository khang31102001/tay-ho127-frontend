import type { ManagedSeoSchema } from "../types/seo-schema.types";

/**
 * MOCK CONTRACT — ví dụ duy nhất: product-bc001 có thêm SKU/Brand (Product
 * entity không có 2 field này — xem product.types.ts) để minh hoạ Task 7/8
 * (chỉ lưu phần KHÔNG derive được từ entity, không lưu lại toàn bộ schema).
 * Mọi entity khác cố tình KHÔNG có override — Product/Article/BreadcrumbList/
 * Organization/Restaurant/WebSite schema của chúng generate 100% tự động.
 */
export const SEED_SEO_SCHEMA: ManagedSeoSchema[] = [
  {
    id: "seo-schema-product-bc001-product",
    entityType: "product",
    entityId: "product-bc001",
    schemaType: "Product",
    config: { sku: "BC-001", brand: "Bánh Cuốn Tây Hồ 127" },
    customJsonLd: null,
    isCustomOverride: false,
    isActive: true,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
];
