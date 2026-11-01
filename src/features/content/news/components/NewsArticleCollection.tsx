import { cn } from "@/core/utils/cn";
import { SwiperCarousel } from "@/shared/ui/SwiperCarousel";

import type { NewsArticleSummaryView } from "../types/news.types";
import { NewsCard } from "./NewsCard";

/** Tối đa số bài hiện dạng lưới (1 hàng 4 cột trên desktop); nhiều hơn thì chuyển sang trượt ngang. */
const GRID_MAX_ARTICLES = 4;

type NewsArticleCollectionProps = {
  articles: NewsArticleSummaryView[];
  className?: string;
};

/**
 * Một khối bài trên trang /tin-tuc (Tin nổi bật, Tin mới, từng danh mục): ≤ 4 bài → lưới, > 4 bài →
 * swiper để khối không kéo dài thành nhiều hàng. Không có bài thì không render gì — nơi gọi ẩn cả khối.
 */
export function NewsArticleCollection({ articles, className }: NewsArticleCollectionProps) {
  if (articles.length === 0) return null;

  if (articles.length <= GRID_MAX_ARTICLES) {
    return (
      <div className={cn("grid gap-8 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    );
  }

  return (
    <SwiperCarousel
      slidesPerView={1.1}
      spaceBetween={16}
      breakpoints={{
        640: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 4, spaceBetween: 32 },
      }}
      navigation
      // Nút prev/next xuống hàng dưới: mép phải mobile có cột nút nổi (FloatingActions) che mất nút next.
      navigationPosition="bottom"
      pagination
      className={cn("text-brand-ink [&_.swiper-slide]:!h-auto", className)}
    >
      {articles.map((article) => (
        <div key={article.id} className="grid h-full py-2">
          <NewsCard article={article} />
        </div>
      ))}
    </SwiperCarousel>
  );
}
