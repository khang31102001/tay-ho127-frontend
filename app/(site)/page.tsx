import type { Metadata } from "next";

import {
  TopHero,
  StorySection,
  PromotionZone,
  FavoriteSection,
  ExperienceSection,
  TestimonialsSection,
} from "@/features/home";
import { fetchFeaturedMenu } from "@/features/menu";
// Import thẳng service server-only (không qua barrel — barrel re-export cả UI Admin "use client").
import { getSiteBrand } from "@/features/brand-profile/services/brand-public.service";
import { buildMetadata } from "@/lib/seo/build-metadata";
// Import thẳng service (không qua barrel @/features/seo) — barrel đó re-export
// cả UI Admin (SeoDashboard/SeoEditor/...), cùng lý do đã áp dụng cho
// @/features/articles ở app/(site)/tin-tuc/page.tsx.
import { resolveSeoPayloadForEntity } from "@/features/seo/services/seo-resolver.service";
import { site } from "@/data/site";

/**
 * Homepage là entity_type="homepage" (singleton, entityId=null) trong SEO
 * Metadata (xem Admin > SEO > Metadata > Trang chủ) — không còn build tĩnh
 * từ site.ts trực tiếp, để Admin cấu hình được qua resolveSeoPayloadForEntity().
 */
export async function generateMetadata(): Promise<Metadata> {
  const seoPayload = await resolveSeoPayloadForEntity({
    entityType: "homepage",
    entityId: null,
    path: "/",
    defaults: { title: site.name, description: site.tagline, imageMediaId: null },
  });

  return buildMetadata(seoPayload);
}

// Trang chủ index: các section nối tiếp nhau theo scroll dọc thông thường.
// Server Component nên fetch dữ liệu "Món yêu thích" trước khi render, tránh
// FavoriteSection (Client Component) phải tự fetch và gây giật hình lúc mount.
export default async function HomePage() {
  const [favoriteItems, brand] = await Promise.all([fetchFeaturedMenu(), getSiteBrand()]);

  return (
    <>
      <TopHero brand={brand} />
      <StorySection />
      <PromotionZone />
      <FavoriteSection items={favoriteItems} />
      <ExperienceSection />
      <TestimonialsSection />
    </>
  );
}
