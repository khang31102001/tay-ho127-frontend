import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";
// fetchMenu qua barrel @/features/menu là an toàn cho Site (barrel này không
// re-export UI admin) — đúng cách app/(site)/thuc-don/page.tsx đang dùng.
import { fetchMenu } from "@/features/menu";
// Bài viết đã xuất bản lấy từ Backend (features/content-public, chỉ chạy phía server).
import { listPublishedArticles } from "@/features/content-public";
// Import thẳng service (không qua barrel @/features/seo) — cùng lý do.
import { listSeoMetadata } from "@/features/seo/services/seo-metadata.service";
import { seoMetadataRowId } from "@/features/seo/utils/seo-metadata-key";

// Dữ liệu (bài viết, thực đơn) đổi bất kỳ lúc nào qua Admin — không render tĩnh lúc build.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [menuResponse, articles, seoOverrides] = await Promise.all([
    fetchMenu(),
    listPublishedArticles(),
    listSeoMetadata(),
  ]);

  // Task 26: page bị đặt noindex qua SEO Metadata (Admin > SEO) không nên có
  // mặt trong sitemap — search engine sẽ vẫn crawl được URL (không disallow ở
  // robots.txt) nhưng ta không chủ động mời index qua sitemap.
  const noindexKeys = new Set(
    seoOverrides.filter((row) => !row.robotsIndex).map((row) => seoMetadataRowId(row.entityType, row.entityId)),
  );

  const allStaticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/thuc-don`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/bai-viet`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/tin-tuc`, changeFrequency: "daily", priority: 0.7 },
  ];
  const staticRoutes = allStaticRoutes.filter(
    (route) => !(route.url === `${siteUrl}/` && noindexKeys.has(seoMetadataRowId("homepage", null))),
  );

  const productRoutes: MetadataRoute.Sitemap = (menuResponse.data?.menu?.groups ?? [])
    .flatMap((group) => group.categories ?? [])
    .flatMap((category) => category.subCategories ?? [])
    .flatMap((subCategory) => subCategory.products ?? [])
    .filter((product) => !noindexKeys.has(seoMetadataRowId("product", product.slug ?? "")))
    .map((product) => ({
      url: `${siteUrl}/thuc-don/${product.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  // Bài viết hiện có mặt ở cả /bai-viet và /tin-tuc (2 route song song, xem
  // quyết định ở Phase News) — cả 2 đều là URL thật, đưa cả 2 vào sitemap.
  const articleRoutes: MetadataRoute.Sitemap = articles
    .filter((article) => !noindexKeys.has(seoMetadataRowId("article", article.id)))
    .flatMap((article) => {
      const lastModified = article.updatedAt ? new Date(article.updatedAt) : undefined;

      return [
        { url: `${siteUrl}/bai-viet/${article.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.5 },
        { url: `${siteUrl}/tin-tuc/${article.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.5 },
      ];
    });

  // Category và Content Page (Task 26) CHƯA có route public nào render
  // (xem seo-architecture-analysis.md mục 2.6/2.7) — không thêm vào sitemap
  // để tránh URL không tồn tại thật, không phải bỏ sót.
  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
