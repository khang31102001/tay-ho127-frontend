import { Container } from "@/shared/ui/Container";
import {
  NewsCategorySections,
  NewsFeaturedCarousel,
  NewsHero,
  NewsLatestList,
  NewsListingSection,
  NewsSectionHeading,
  buildCategorySections,
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

const FEATURED_LIMIT = 8;
const LATEST_LIMIT = 6;
const PER_CATEGORY_LIMIT = 3;

/**
 * Bố cục kiểu cổng tin: Tin nổi bật (trượt ngang) → Tin mới (danh sách gọn) → từng danh mục →
 * Tất cả bài viết (lọc + "Xem thêm"). Mọi khối lấy từ cùng một danh sách đã tải.
 */
export default async function NewsPage() {
  const [articles, categories] = await Promise.all([listNewsArticles(), listNewsCategories()]);

  const featuredArticles = pickFeaturedArticles(articles, FEATURED_LIMIT);
  const latestArticles = articles.slice(0, LATEST_LIMIT);
  const categorySections = buildCategorySections(articles, categories, PER_CATEGORY_LIMIT);

  return (
    <>
      <NewsHero />

      <section className="section-padding">
        <Container>
          {articles.length === 0 ? (
            <p className="text-brand-muted">Chưa có bài viết nào được xuất bản.</p>
          ) : (
            <div className="space-y-16">
              <section aria-labelledby="news-featured">
                <NewsSectionHeading id="news-featured" title="Tin nổi bật" />
                <div className="mt-4">
                  <NewsFeaturedCarousel articles={featuredArticles} />
                </div>
              </section>

              <section aria-labelledby="news-latest">
                <NewsSectionHeading id="news-latest" title="Tin mới" href="#news-all" linkLabel="Xem thêm" />
                <div className="mt-2">
                  <NewsLatestList articles={latestArticles} />
                </div>
              </section>

              <NewsCategorySections sections={categorySections} />

              <section id="news-all" aria-labelledby="news-all-heading" className="scroll-mt-28">
                <NewsSectionHeading id="news-all-heading" title="Tất cả bài viết" />
                <div className="mt-6">
                  <NewsListingSection articles={articles} categories={categories} />
                </div>
              </section>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
