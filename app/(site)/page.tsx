import {
  TopHero,
  StorySection,
  PromotionZone,
  FavoriteSection,
  ExperienceSection,
  TestimonialsSection,
} from "@/features/home";
import { fetchFeaturedMenu } from "@/features/menu";

// Trang chủ index: các section nối tiếp nhau theo scroll dọc thông thường.
// Server Component nên fetch dữ liệu "Món yêu thích" trước khi render, tránh
// FavoriteSection (Client Component) phải tự fetch và gây giật hình lúc mount.
export default async function HomePage() {
  const favoriteItems = await fetchFeaturedMenu();

  return (
    <>
      <TopHero />
      <StorySection />
      <PromotionZone />
      <FavoriteSection items={favoriteItems} />
      <ExperienceSection />
      <TestimonialsSection />
    </>
  );
}
