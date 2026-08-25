import { TopHero } from "@/components/home/TopHero";
import { StorySection } from "@/components/home/StorySection";
import { PromotionZone } from "@/components/home/PromotionZone";
import { FavoriteSection } from "@/components/home/FavoriteSection";
import { ExperienceSection } from "@/components/home/ExperienceSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

// Trang chủ index: các section nối tiếp nhau theo scroll dọc thông thường.
export default function HomePage() {
  return (
    <>
      <TopHero />
      <StorySection />
      <PromotionZone />
      <FavoriteSection />
      <ExperienceSection />
      <TestimonialsSection />
    </>
  );
}
