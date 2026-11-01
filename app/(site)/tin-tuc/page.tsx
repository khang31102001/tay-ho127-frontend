import { Container } from "@/shared/ui/Container";
import {
  NewsArticleCollection,
  NewsCategorySections,
  NewsHero,
  NewsListingSection,
  NewsSectionHeading,
  buildCategorySections,
  listCategoriesWithArticles,
  listNewsArticles,
  listNewsCategories,
  pickFeaturedArticles,
} from "@/features/content/news";
import { buildMetadata } from "@/features/seo/utils/build-metadata";

export const metadata = buildMetadata({
  title: "Tin tức",
  description: "Công thức, câu chuyện thương hiệu, ưu đãi và hoạt động mới nhất từ Bánh Cuốn Tây Hồ 127.",
  path: "/tin-tuc",
});

/** Số bài tối đa mỗi khối — ≤ 4 bài hiện lưới, nhiều hơn chuyển sang swiper (NewsArticleCollection). */
const SECTION_LIMIT = 8;

/**
 * Bố cục kiểu cổng tin: Tin nổi bật → Tin mới → từng danh mục → Tất cả bài viết (lọc + "Xem thêm").
 * Mọi khối lấy từ cùng một danh sách đã tải; khối nào không có bài thì ẩn hẳn (không hiện tiêu đề rỗng).
 */
export default async function NewsPage() {
  const [articles, categories] = await Promise.all([listNewsArticles(), listNewsCategories()]);

  const featuredArticles = pickFeaturedArticles(articles, SECTION_LIMIT);
  const latestArticles = articles.slice(0, SECTION_LIMIT);
  const categorySections = buildCategorySections(articles, categories, SECTION_LIMIT);
  const filterCategories = listCategoriesWithArticles(articles, categories);

  return (
    <>
      <NewsHero />

      <section className="section-padding">
        <Container>
          {articles.length === 0 ? (
            <p className="text-brand-muted">Chưa có bài viết nào được xuất bản.</p>
          ) : (
            <div className="space-y-16">
              {featuredArticles.length > 0 && (
                <section aria-labelledby="news-featured">
                  <NewsSectionHeading id="news-featured" title="Tin nổi bật" />
                  <NewsArticleCollection articles={featuredArticles} className="mt-6" />
                </section>
              )}

              <section aria-labelledby="news-latest">
                <NewsSectionHeading id="news-latest" title="Tin mới" href="#news-all" linkLabel="Xem thêm" />
                <NewsArticleCollection articles={latestArticles} className="mt-6" />
              </section>

              <NewsCategorySections sections={categorySections} />

              <section id="news-all" aria-labelledby="news-all-heading" className="scroll-mt-28">
                <NewsSectionHeading id="news-all-heading" title="Tất cả bài viết" />
                <div className="mt-6">
                  <NewsListingSection articles={articles} categories={filterCategories} />
                </div>
              </section>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
