"use client";

import { useMemo, useState } from "react";

import type { NewsArticleView, NewsCategoryOption } from "../types/news.types";
import { ALL_CATEGORY_VALUE, NewsCategoryFilter } from "./NewsCategoryFilter";
import { NewsGrid } from "./NewsGrid";

const PAGE_SIZE = 9;

type NewsListingSectionProps = {
  articles: NewsArticleView[];
  categories: NewsCategoryOption[];
};

/**
 * Nhận dữ liệu đã fetch sẵn từ Server Component (page.tsx) — lọc theo danh
 * mục và "Load More" đều xử lý trên mảng có sẵn, không gọi lại API mỗi lần
 * đổi filter (đủ nhanh với quy mô mock hiện tại, và tránh 1 client fetch
 * round-trip không cần thiết).
 */
export function NewsListingSection({ articles, categories }: NewsListingSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY_VALUE);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY_VALUE) return articles;
    return articles.filter((article) => article.categorySlug === selectedCategory);
  }, [articles, selectedCategory]);

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = filteredArticles.length > visibleCount;

  function handleCategoryChange(value: string) {
    setSelectedCategory(value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div>
      <NewsCategoryFilter categories={categories} selected={selectedCategory} onChange={handleCategoryChange} />

      <NewsGrid articles={visibleArticles} className="mt-6" emptyMessage="Không có bài viết nào trong danh mục này." />

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="focus-ring rounded-full border border-brand-line bg-white px-8 py-3 text-sm font-bold text-brand-ink transition hover:border-brand-red hover:text-brand-red"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}
