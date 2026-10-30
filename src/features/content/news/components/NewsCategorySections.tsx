import type { NewsCategorySection } from "../utils/news-selectors";
import { NewsGrid } from "./NewsGrid";
import { NewsSectionHeading } from "./NewsSectionHeading";

type NewsCategorySectionsProps = {
  sections: NewsCategorySection[];
};

/** Mỗi danh mục một khối: vài bài mới nhất + link sang trang chuyên mục (kèm tổng số khi còn bài khác). */
export function NewsCategorySections({ sections }: NewsCategorySectionsProps) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-14">
      {sections.map(({ category, articles, total }) => (
        <section key={category.id} aria-labelledby={`news-category-${category.slug}`}>
          <NewsSectionHeading
            id={`news-category-${category.slug}`}
            title={category.name}
            href={`/tin-tuc/danh-muc/${category.slug}`}
            linkLabel={total > articles.length ? `Xem tất cả (${total})` : "Xem chuyên mục"}
          />
          <NewsGrid articles={articles} className="mt-6" />
        </section>
      ))}
    </div>
  );
}
