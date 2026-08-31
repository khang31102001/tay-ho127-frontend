import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";
// fetchMenu qua barrel @/features/menu là an toàn cho Site (barrel này không
// re-export UI admin) — đúng cách app/(site)/thuc-don/page.tsx đang dùng.
import { fetchMenu } from "@/features/menu";
// listPublishedArticles import thẳng service (không qua barrel features/articles
// vì barrel đó re-export cả Explorer/Editor admin) — xem app/(site)/bai-viet/page.tsx.
import { listPublishedArticles } from "@/features/articles/services/article.service";

// Dữ liệu đọc từ mock/localStorage có thể đổi bất kỳ lúc nào qua Admin — không cache tĩnh.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/thuc-don`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/bai-viet`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/tin-tuc`, changeFrequency: "daily", priority: 0.7 },
  ];

  const [menuResponse, articles] = await Promise.all([fetchMenu(), listPublishedArticles()]);

  const productRoutes: MetadataRoute.Sitemap = (menuResponse.data?.menu?.groups ?? [])
    .flatMap((group) => group.categories ?? [])
    .flatMap((category) => category.subCategories ?? [])
    .flatMap((subCategory) => subCategory.products ?? [])
    .map((product) => ({
      url: `${siteUrl}/thuc-don/${product.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  // Bài viết hiện có mặt ở cả /bai-viet và /tin-tuc (2 route song song, xem
  // quyết định ở Phase News) — cả 2 đều là URL thật, đưa cả 2 vào sitemap.
  const articleRoutes: MetadataRoute.Sitemap = articles.flatMap((article) => {
    const lastModified = article.updatedAt ? new Date(article.updatedAt) : undefined;

    return [
      { url: `${siteUrl}/bai-viet/${article.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.5 },
      { url: `${siteUrl}/tin-tuc/${article.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.5 },
    ];
  });

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
