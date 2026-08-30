import { Container } from "@/components/ui/Container";
import { FeaturedArticle, NewsHero, NewsListingSection, listNewsArticles, listNewsCategories } from "@/features/news";

export const metadata = {
  title: "Tin tức | Bánh Cuốn Tây Hồ 127",
  description: "Công thức, câu chuyện thương hiệu, ưu đãi và hoạt động mới nhất từ Bánh Cuốn Tây Hồ 127.",
};

export default async function NewsPage() {
  const [articles, categories] = await Promise.all([listNewsArticles(), listNewsCategories()]);

  const [featuredArticle, ...restArticles] = articles;

  return (
    <>
      <NewsHero />

      <section className="section-padding">
        <Container>
          {articles.length === 0 ? (
            <p className="text-brand-muted">Chưa có bài viết nào được xuất bản.</p>
          ) : (
            <div className="space-y-12">
              <FeaturedArticle article={featuredArticle} />
              <NewsListingSection articles={restArticles} categories={categories} />
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
