// Import thẳng service (không qua barrel @/features/brand-profile, @/features/media)
// — file này được gọi trực tiếp từ app/(site)/**, 2 barrel đó re-export cả UI
// Admin (BrandProfileEditor, MediaExplorer/MediaEditor).
import { getSiteBrand } from "@/features/brand-profile/services/brand-public.service";
import { listMedia } from "@/features/media/services/public-media.service";
import { getSiteUrl } from "@/lib/site-url";

import { getPublicSeoSchema } from "./seo-public.service";
import {
  buildArticleSchema,
  buildBreadcrumbListSchema,
  buildOrganizationSchema,
  buildProductSchema,
  buildRestaurantSchema,
  buildWebSiteSchema,
  type BreadcrumbItem,
  type JsonLdObject,
} from "../utils/schema-generators";

/**
 * GLOBAL SCHEMA (Task 9): Organization + Restaurant + WebSite, derive 100% từ
 * Thông tin thương hiệu + Chi nhánh chính (features/brand-profile) — KHÔNG qua seo_schema, vì Thông tin thương hiệu
 * đã có màn Admin riêng để chỉnh các field này (Task 8: không lưu lại bản sao
 * dữ liệu đã có chỗ quản lý). Render 1 lần duy nhất ở app/(site)/layout.tsx.
 */
export async function resolveGlobalSchemas(): Promise<JsonLdObject[]> {
  const [brand, mediaList] = await Promise.all([getSiteBrand(), listMedia()]);
  const siteUrl = getSiteUrl();
  const mediaById = new Map(mediaList.map((media) => [media.id, media]));
  const logoUrl = brand.logoMediaId ? mediaById.get(brand.logoMediaId)?.url : undefined;
  const sameAs = brand.socialLinks.filter((link) => link.isActive).map((link) => link.url);

  return [
    buildOrganizationSchema({
      name: brand.name,
      url: siteUrl,
      logoUrl,
      phone: brand.phone,
      email: brand.email,
      sameAs,
    }),
    buildRestaurantSchema({
      name: brand.name,
      url: siteUrl,
      imageUrl: logoUrl,
      phone: brand.phone,
      streetAddress: brand.addressLine,
      addressLocality: brand.district || brand.ward,
      addressRegion: brand.province,
      openTime: brand.openTime,
      closeTime: brand.closeTime,
    }),
    buildWebSiteSchema(siteUrl, brand.name),
  ];
}

export type ProductPageSchemaInput = {
  entityId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  path: string;
  breadcrumb: BreadcrumbItem[];
};

/**
 * PAGE SCHEMA — Product (Task 20): Product + Offer lồng bên trong, cộng
 * BreadcrumbList. Nếu Admin đã bật Custom JSON-LD (Advanced Mode, Task 10)
 * cho entity này thì dùng nguyên JSON đó thay cho object generate — JSON đã
 * được validate hợp lệ lúc lưu (Backend + useSeoSchemaForm.ts) nên parse an toàn.
 * `entityId` là id (Guid) của sản phẩm, cùng khóa với override SEO Metadata.
 */
export async function resolveProductPageSchemas(input: ProductPageSchemaInput): Promise<JsonLdObject[]> {
  const siteUrl = getSiteUrl();
  const override = await getPublicSeoSchema("product", input.entityId, "Product");

  let productSchema: JsonLdObject;

  if (override?.isActive && override.isCustomOverride && override.customJsonLd) {
    try {
      productSchema = JSON.parse(override.customJsonLd) as JsonLdObject;
    } catch {
      // Không thể xảy ra nếu validate đúng lúc lưu (useSeoSchemaForm.ts) — vẫn
      // fallback về schema generate để trang không bao giờ vỡ vì JSON lỗi (Task 33).
      productSchema = buildProductSchema({
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        price: input.price,
        url: `${siteUrl}${input.path}`,
      });
    }
  } else {
    productSchema = buildProductSchema({
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      price: input.price,
      url: `${siteUrl}${input.path}`,
      sku: override?.isActive ? override.config?.sku : undefined,
      brand: override?.isActive ? override.config?.brand : undefined,
    });
  }

  return [productSchema, buildBreadcrumbListSchema(siteUrl, input.breadcrumb)];
}

export type ArticlePageSchemaInput = {
  headline: string;
  description?: string;
  imageUrl?: string;
  path: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  authorName: string;
  breadcrumb: BreadcrumbItem[];
};

/**
 * PAGE SCHEMA — Article (Task 22): chưa wire override qua seo_schema (chưa
 * có nhu cầu cụ thể nào cần field ngoài Article entity, khác Product có ví dụ
 * SKU/Brand rõ ràng ở Task 7) — generate thuần từ dữ liệu bài viết + brand
 * (publisher). Có thể bổ sung override sau theo đúng pattern Product ở trên.
 */
export async function resolveArticlePageSchemas(input: ArticlePageSchemaInput): Promise<JsonLdObject[]> {
  const [brand, mediaList] = await Promise.all([getSiteBrand(), listMedia()]);
  const siteUrl = getSiteUrl();
  const mediaById = new Map(mediaList.map((media) => [media.id, media]));
  const logoUrl = brand.logoMediaId ? mediaById.get(brand.logoMediaId)?.url : undefined;

  const articleSchema = buildArticleSchema({
    headline: input.headline,
    description: input.description,
    imageUrl: input.imageUrl,
    url: `${siteUrl}${input.path}`,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    authorName: input.authorName,
    publisherName: brand.name,
    publisherLogoUrl: logoUrl,
  });

  return [articleSchema, buildBreadcrumbListSchema(siteUrl, input.breadcrumb)];
}
