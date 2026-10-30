import type { NewsArticleSummaryView, NewsCategoryOption } from "../types/news.types";

/**
 * Hàm thuần chọn/gom bài từ danh sách đã tải (mới nhất trước) — không gọi API, để trang
 * /tin-tuc và trang danh mục dùng chung một nguồn dữ liệu.
 */

/** Admin gắn thẻ có slug này cho bài muốn đưa lên "Tin nổi bật" (Backend chưa có cờ riêng). */
export const FEATURED_TAG_SLUG = "noi-bat";

/** Bài gắn thẻ nổi bật; chưa có bài nào được gắn thì lấy các bài mới nhất để mục không bị trống. */
export function pickFeaturedArticles(articles: NewsArticleSummaryView[], limit: number): NewsArticleSummaryView[] {
  const tagged = articles.filter((article) => article.tagSlugs.includes(FEATURED_TAG_SLUG));
  return (tagged.length > 0 ? tagged : articles).slice(0, limit);
}

/** Id của danh mục gốc và mọi danh mục con cháu (cây tối đa 3 cấp). */
function collectCategoryIds(categories: NewsCategoryOption[], rootId: string): Set<string> {
  const ids = new Set([rootId]);
  let added = true;

  while (added) {
    added = false;
    for (const category of categories) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        added = true;
      }
    }
  }

  return ids;
}

/** Bài thuộc danh mục hoặc danh mục con của nó. */
export function filterArticlesInCategory(
  articles: NewsArticleSummaryView[],
  categories: NewsCategoryOption[],
  category: NewsCategoryOption,
): NewsArticleSummaryView[] {
  const ids = collectCategoryIds(categories, category.id);
  return articles.filter((article) => article.categoryId !== null && ids.has(article.categoryId));
}

export type NewsCategorySection = {
  category: NewsCategoryOption;
  articles: NewsArticleSummaryView[];
  total: number;
};

/** Mỗi danh mục cấp 1 một khối (giữ thứ tự sortOrder của Backend), bỏ danh mục chưa có bài. */
export function buildCategorySections(
  articles: NewsArticleSummaryView[],
  categories: NewsCategoryOption[],
  perSection: number,
): NewsCategorySection[] {
  return categories
    .filter((category) => category.parentId === null)
    .map((category) => {
      const inCategory = filterArticlesInCategory(articles, categories, category);
      return { category, articles: inCategory.slice(0, perSection), total: inCategory.length };
    })
    .filter((section) => section.total > 0);
}
