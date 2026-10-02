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
// Import thẳng service (không qua barrel) — cùng lý do đã áp dụng cho
// @/features/articles ở app/(site)/bai-viet/page.tsx.
import { getArticleBySlug } from "@/features/articles/services/article.service";
import { buildMetadata } from "@/lib/seo/build-metadata";
import { resolveSeoPayload } from "@/lib/seo/resolve-seo-payload";
import { resolveSeoPayloadForEntity } from "@/features/seo/services/seo-resolver.service";
import { resolveArticlePageSchemas } from "@/features/seo/services/seo-schema-resolver.service";
import { JsonLd } from "@/components/shared/JsonLd";

type NewsDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const seoPayload = await resolveSeoPayload({
    // TEMPORARY CONTRACT: endpoint đề xuất cho khi có Backend ASP.NET Core thật.
    endpoint: `/news/${params.slug}/seo`,
    mockResolver: async () => {
      // getNewsArticleBySlug giữ nguyên gate "chỉ bài đã publish" (khác /bai-viet
      // cho xem preview draft) — không đổi hành vi cũ.
      const article = await getNewsArticleBySlug(params.slug);
      if (!article) return null;

      // View NewsArticleView không giữ featuredMediaId (chỉ có coverImageUrl đã
      // resolve sẵn) — lấy thêm entity gốc để có mediaId thật cho fallback OG image.
      const rawArticle = await getArticleBySlug(params.slug);

      return resolveSeoPayloadForEntity({
        entityType: "article",
        entityId: article.id,
        path: `/tin-tuc/${params.slug}`,
        defaults: {
          title: article.title,
          description: article.excerpt,
          imageMediaId: rawArticle?.featuredMediaId ?? null,
        },
        contentType: "article",
        publishedTime: article.publishedAt,
      });
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

  // PAGE SCHEMA (Task 22): Article + BreadcrumbList. article.updatedAt không
  // có trên NewsArticleView (view chỉ giữ field cần cho hiển thị) — lấy thêm
  // entity gốc, cùng lý do đã áp dụng cho featuredMediaId ở generateMetadata().
  const rawArticle = await getArticleBySlug(params.slug);
  const schemas = await resolveArticlePageSchemas({
    headline: article.title,
    description: article.excerpt,
    imageUrl: article.coverImageUrl ?? undefined,
    path: `/tin-tuc/${params.slug}`,
    publishedAt: article.publishedAt,
    updatedAt: rawArticle?.updatedAt ?? null,
    authorName: article.author,
    breadcrumb: [
      { name: "Trang chủ", path: "/" },
      { name: "Tin tức", path: "/tin-tuc" },
      { name: article.title, path: `/tin-tuc/${params.slug}` },
    ],
  });

  return (
    <section className="section-padding">
      <JsonLd data={schemas} />

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
