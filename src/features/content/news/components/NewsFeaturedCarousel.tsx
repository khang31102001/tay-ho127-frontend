"use client";

import { SwiperCarousel } from "@/shared/ui/SwiperCarousel";

import type { NewsArticleSummaryView } from "../types/news.types";
import { NewsCard } from "./NewsCard";

type NewsFeaturedCarouselProps = {
  articles: NewsArticleSummaryView[];
};

/** "Tin nổi bật": trượt ngang bằng NewsCard — 1 thẻ (mobile), 2 (tablet), 3 (desktop). */
export function NewsFeaturedCarousel({ articles }: NewsFeaturedCarouselProps) {
  if (articles.length === 0) return null;

  return (
    <SwiperCarousel
      slidesPerView={1.1}
      spaceBetween={16}
      breakpoints={{
        640: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 32 },
      }}
      navigation={articles.length > 1}
      className="text-brand-ink"
    >
      {articles.map((article) => (
        <div key={article.id} className="grid h-full py-2">
          <NewsCard article={article} />
        </div>
      ))}
    </SwiperCarousel>
  );
}
