// Import Hero trang chủ.
import { Hero } from "@/components/sections/Hero";
// Import section chứng thực thương hiệu.
import { BrandProof } from "@/components/sections/BrandProof";
// Import section điểm khác biệt.
import { Highlights } from "@/components/sections/Highlights";
// Import preview thực đơn.
import { MenuPreview } from "@/components/sections/MenuPreview";
// Import section câu chuyện.
import { StorySection } from "@/components/home/StorySection";
// Import CTA cuối trang.
import { CTASection } from "@/components/sections/CTASection";
import { PromotionZone } from "@/components/home/PromotionZone";
import { FavoriteSection } from "@/components/home/FavoriteSection";
import { ImageActivitySection } from "@/components/home/ImageActivitySection";
import { Testimonials } from "@/components/home/Testimonials";
import { StatsMichelin } from "@/components/home/StatsMichelin";
import { BrandProofSection } from "@/components/home/BrandProofSection";
import { MainHero } from "@/components/home/MainHero";
import { TopHero } from "@/components/home/TopHero";

// Trang chủ index: gom các section chính theo thứ tự landing page.
export default function HomePage() {
  // Render landing page với hệ section tách nhỏ để dễ bảo trì.
  return (
   <div className="">
    {/* h-svh snap-y snap-proximity overflow-y-auto overscroll-y-contain md:snap-mandatory */}
      <TopHero />
      <StorySection />
      <PromotionZone />
      <FavoriteSection />
     
      <BrandProofSection />
      <Testimonials />
   </div>
  );
}
