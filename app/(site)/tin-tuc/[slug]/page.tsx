import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/ui/Container";
import {
  ArticleContent,
  ArticleCover,
  ArticleHeader,
  RelatedArticles,
  getNewsArticleBySlug,
  listRelatedNewsArticles,
} from "@/features/news";
import { buildMetadata } from "@/lib/seo/build-metadata";
import { resolveSeoPayload } from "@/lib/seo/resolve-seo-payload";

type NewsDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const seoPayload = await resolveSeoPayload({
    // TEMPORARY CONTRACT: endpoint đề xuất cho khi có Backend ASP.NET Core thật.
    endpoint: `/news/${params.slug}/seo`,
    mockResolver: async () => {
      const article = await getNewsArticleBySlug(params.slug);
      if (!article) return null;

      return {
        title: article.title,
        description: article.excerpt,
        path: `/tin-tuc/${params.slug}`,
        image: article.coverImageUrl ?? undefined,
        type: "article",
        publishedTime: article.publishedAt,
      };
    },
  });

  if (!seoPayload) {
    return buildMetadata({
      title: "Không tìm thấy bài viết",
      description: "Bài viết này không tồn tại hoặc chưa được xuất bản.",
      path: `/tin-tuc/${params.slug}`,
      noindex: true,
    });
  }

  return buildMetadata(seoPayload);
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const article = await getNewsArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await listRelatedNewsArticles(article);

  return (
    <section className="section-padding">
      <Container className="max-w-3xl">
        <Link
          href="/tin-tuc"
          className="focus-ring inline-flex items-center gap-1.5 rounded-full text-sm font-bold text-brand-green transition hover:opacity-80"
        >
          <ChevronLeft size={18} />
          Quay lại Tin tức
        </Link>

        <div className="mt-6">
          <ArticleHeader
            category={article.categoryName}
            title={article.title}
            publishedAt={article.publishedAt}
            readingTimeMinutes={article.readingTimeMinutes}
            excerpt={article.excerpt}
          />
        </div>

        <ArticleCover src={article.coverImageUrl} alt={article.title} />

        <ArticleContent html={article.content} />

        {article.tagNames.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-brand-line pt-6">
            {article.tagNames.map((tagName) => (
              <span
                key={tagName}
                className="rounded-full border border-brand-line px-3 py-1 text-xs font-bold text-brand-muted"
              >
                #{tagName}
              </span>
            ))}
          </div>
        )}

        <RelatedArticles articles={relatedArticles} />
      </Container>
    </section>
  );
}
