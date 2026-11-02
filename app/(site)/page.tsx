import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";

import {
  TopHero,
  StorySection,
  PromotionZone,
  FavoriteSection,
  ExperienceSection,
  TestimonialsSection,
  listHomeSlots,
  toHomeAward,
  toHomeHero,
  toHomeStats,
  toHomeStory,
} from "@/features/home";
import { fetchFeaturedMenu } from "@/features/catalog/menu";
// Import thẳng service server-only (không qua barrel — barrel re-export cả UI Admin "use client").
import { getSiteBrand } from "@/features/organization/brand-profile/services/brand-public.service";
import { buildMetadata } from "@/features/seo/utils/build-metadata";
// Import thẳng service (không qua barrel @/features/seo) — barrel đó re-export
// cả UI Admin (SeoDashboard/SeoEditor/...), cùng lý do đã áp dụng cho
// @/features/articles ở app/(site)/tin-tuc/page.tsx.
import { resolveSeoPayloadForEntity } from "@/features/seo/services/seo-resolver.service";
import { site } from "@/core/config/site-data";

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

/**
 * Trang chủ = các ô (slot) theo đúng thứ tự Admin sắp ở Admin → Nội dung → Trang → Trang chủ → Sections.
 * Ô bị ẩn, chưa có section hoặc thiếu trường bắt buộc thì không hiển thị. Key các ô khai báo cho Admin ở
 * features/content/page-sections/types/page-templates.ts (mã trang "home").
 *
 * "stats" và "award" cùng nằm trong một khối nền (ExperienceSection): khối hiện ở vị trí ô nào đứng trước.
 * Dữ liệu "Món yêu thích" fetch ở server trước khi render, tránh FavoriteSection (Client Component) tự fetch.
 */
export default async function HomePage() {
  const [slots, brand, favoriteItems] = await Promise.all([listHomeSlots(), getSiteBrand(), fetchFeaturedMenu()]);
  const sectionOf = (key: string) => slots.find((slot) => slot.key === key)?.section;

  const heroSection = sectionOf("hero");
  const storySection = sectionOf("story");
  const statsSection = sectionOf("stats");
  const awardSection = sectionOf("award");
  const [story, stats, award] = await Promise.all([
    storySection ? toHomeStory(storySection) : null,
    statsSection ? toHomeStats(statsSection) : null,
    awardSection ? toHomeAward(awardSection) : null,
  ]);
  const hero = heroSection ? toHomeHero(heroSection) : null;
  const experienceKey = slots.find((slot) => slot.key === "stats" || slot.key === "award")?.key;

  const blockByKey: Record<string, ReactNode> = {
    hero: hero && <TopHero hero={hero} brand={brand} />,
    story: story && <StorySection story={story} />,
    promotion: <PromotionZone />,
    favorites: <FavoriteSection items={favoriteItems} />,
    testimonials: <TestimonialsSection />,
  };
  if (experienceKey) {
    blockByKey[experienceKey] = <ExperienceSection stats={stats} award={award} />;
  }

  return (
    <>
      {slots.map((slot) => (
        <Fragment key={slot.key}>{blockByKey[slot.key]}</Fragment>
      ))}
    </>
  );
}
