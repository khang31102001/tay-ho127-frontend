import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";
// Import thẳng service (không qua barrel @/features/seo) — barrel đó
// re-export cả UI Admin, cùng lý do đã áp dụng cho @/features/articles ở
// app/(site)/bai-viet/page.tsx.
import { getPublicSeoSettings } from "@/features/seo/services/seo-public.service";

// SEO Settings đổi bất kỳ lúc nào qua Admin — không dựng tĩnh lúc build (Backend có thể chưa
// chạy); độ tươi do cache 60 giây của seo-public.service quyết định, cùng lý do với app/sitemap.ts.
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = getSiteUrl();
  const settings = await getPublicSeoSettings();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Danh sách disallow quản lý tại Admin > SEO > Cài đặt SEO
        // (robotsDisallowPaths) — xem seo-architecture-analysis.md mục 8.3 cho
        // lý do từng path. Không hard-code ở đây nữa.
        disallow: settings.robotsDisallowPaths,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
