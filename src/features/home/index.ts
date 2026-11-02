export { TopHero } from "./components/TopHero";
export { StorySection } from "./components/StorySection";
// SERVER-ONLY — chỉ gọi từ Server Component (app/(site)/page.tsx).
export { listHomeSlots, type HomeSlot } from "./services/home-section.service";
export { toHomeHero, type HomeHero } from "./services/hero.service";
export { toHomeStory, type HomeStory } from "./services/story.service";
export { toHomeStats, type HomeStats } from "./services/stats.service";
export { toHomeAward, type HomeAward } from "./services/award.service";
export { PromotionZone } from "./components/PromotionZone";
export { FavoriteSection } from "./components/FavoriteSection";
export { ExperienceSection } from "./components/ExperienceSection";
export { TestimonialsSection } from "./components/TestimonialsSection";
