import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
// Import thẳng service thay vì qua @/features/articles, @/features/media,
// @/features/article-categories (barrel các feature Admin này re-export cả
// UI Explorer/Editor — import qua barrel sẽ kéo UI admin vào bundle Site,
// xem menu.service.ts để biết lý do).
import { listPublishedArticles } from "@/features/articles/services/article.service";
import { listMedia } from "@/features/media/services/media.service";
import { listArticleCategories } from "@/features/article-categories/services/article-category.service";

export const metadata = {
  title: "Bài viết | Bánh Cuốn Tây Hồ 127",
  description: "Công thức, câu chuyện thương hiệu và tin tức từ Bánh Cuốn Tây Hồ 127.",
};

export default async function ArticleListPage() {
  const [articles, mediaList, categories] = await Promise.all([
    listPublishedArticles(),
    listMedia(),
    listArticleCategories(),
  ]);

  const mediaById = new Map(mediaList.map((media) => [media.id, media]));
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return (
    <section className="section-padding">
      <Container>
        <h1 className="heading-1 text-brand-ink">Bài viết</h1>
        <p className="body-lead mt-3 max-w-2xl">
          Công thức, câu chuyện thương hiệu và tin tức mới nhất từ Bánh Cuốn Tây Hồ 127.
        </p>

        {articles.length === 0 ? (
          <p className="mt-10 text-brand-muted">Chưa có bài viết nào được xuất bản.</p>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const media = article.featuredMediaId ? mediaById.get(article.featuredMediaId) : undefined;
              const category = article.categoryId ? categoryById.get(article.categoryId) : undefined;

              return (
                <Link
                  key={article.id}
                  href={`/bai-viet/${article.slug}`}
                  className="card-surface group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-glow"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-cream">
                    {media && (
                      <Image
                        src={media.url}
                        alt={article.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    {category && (
                      <span className="text-xs font-bold uppercase tracking-wide text-brand-red">
                        {category.name}
                      </span>
                    )}

                    <h2 className="line-clamp-2 text-[18px] font-black leading-snug text-brand-ink">
                      {article.title}
                    </h2>

                    <p className="line-clamp-2 text-sm text-brand-muted">{article.summary}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
