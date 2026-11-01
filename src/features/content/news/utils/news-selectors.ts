import type { NewsArticleSummaryView, NewsCategoryOption } from "../types/news.types";

/**
 * Hàm thuần chọn/gom bài từ danh sách đã tải (mới nhất trước) — không gọi API, để trang
 * /tin-tuc và trang danh mục dùng chung một nguồn dữ liệu.
 */

/**
 * Thẻ cũ từng dùng để đánh dấu bài nổi bật (trước khi Backend có cờ isFeatured). Không còn quyết định
 * khối "Tin nổi bật" — chỉ giữ để bài còn gắn thẻ này không lộ "noi-bat" thành từ khóa SEO.
 */
export const FEATURED_TAG_SLUG = "noi-bat";

/**
 * Bài Admin tick "Hiển thị ở Tin nổi bật", sắp theo featuredOrder (null xếp cuối), cùng thứ tự thì giữ
 * thứ tự sẵn có (mới xuất bản trước). Không có bài nào được tick → mảng rỗng, trang ẩn khối này.
 */
export function pickFeaturedArticles(articles: NewsArticleSummaryView[], limit: number): NewsArticleSummaryView[] {
  const orderOf = (article: NewsArticleSummaryView) => article.featuredOrder ?? Number.MAX_SAFE_INTEGER;

  return articles
    .filter((article) => article.isFeatured)
    .sort((a, b) => orderOf(a) - orderOf(b))
    .slice(0, limit);
}

/** Danh mục có ít nhất một bài (đúng danh mục đó) — để bộ lọc không hiện nút bấm vào ra rỗng. */
export function listCategoriesWithArticles(
  articles: NewsArticleSummaryView[],
  categories: NewsCategoryOption[],
): NewsCategoryOption[] {
  const usedIds = new Set(articles.map((article) => article.categoryId));
  return categories.filter((category) => usedIds.has(category.id));
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
