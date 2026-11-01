import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/shared/ui/Container";
import { HeaderBackdrop } from "@/shared/ui/HeaderBackdrop";
import {
  ArticleAdjacentNav,
  ArticleContent,
  ArticleCover,
  ArticleHeader,
  ArticleShareButtons,
  ArticleStoreInfo,
  FEATURED_TAG_SLUG,
  NewsBreadcrumb,
  RelatedArticles,
  getAdjacentNewsArticles,
  getNewsArticleBySlug,
  listRelatedNewsArticles,
} from "@/features/content/news";
import { getSiteBrand } from "@/features/organization/brand-profile/services/brand-public.service";
import { buildMetadata } from "@/features/seo/utils/build-metadata";
import { resolveSeoPayloadForEntity } from "@/features/seo/services/seo-resolver.service";
import { resolveArticlePageSchemas } from "@/features/seo/services/seo-schema-resolver.service";
import { JsonLd } from "@/shared/components/JsonLd";

type NewsDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  // Chỉ bài đã publish (Backend trả 404 cho nháp/lưu trữ).
  const article = await getNewsArticleBySlug(params.slug);
  const seoPayload = article
    ? await resolveSeoPayloadForEntity({
        entityType: "article",
        entityId: article.id,
        path: `/tin-tuc/${params.slug}`,
        defaults: {
          title: article.title,
          description: article.excerpt,
          imageMediaId: article.featuredMediaId,
        },
        contentType: "article",
        publishedTime: article.publishedAt,
      })
    : null;

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

  const [relatedArticles, adjacentArticles, brand] = await Promise.all([
    listRelatedNewsArticles(article),
    getAdjacentNewsArticles(article),
    getSiteBrand(),
  ]);

  const path = `/tin-tuc/${params.slug}`;
  const categoryPath = article.categorySlug ? `/tin-tuc/danh-muc/${article.categorySlug}` : null;
  const breadcrumb = [
    { name: "Trang chủ", path: "/" },
    { name: "Tin tức", path: "/tin-tuc" },
    ...(article.categoryName && categoryPath ? [{ name: article.categoryName, path: categoryPath }] : []),
    { name: article.title, path },
  ];

  // Thẻ "nổi bật" chỉ là dấu hiệu cho trang /tin-tuc, không hiện như một từ khóa.
  const keywords = article.tagNames.filter((_, index) => article.tagSlugs[index] !== FEATURED_TAG_SLUG);

  // PAGE SCHEMA (Task 22): Article + BreadcrumbList.
  const schemas = await resolveArticlePageSchemas({
    headline: article.title,
    description: article.excerpt,
    imageUrl: article.coverImageUrl ?? undefined,
    path,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: article.author,
    breadcrumb,
  });

  return (
    <>
    <HeaderBackdrop />
    <section className="section-padding">
      <JsonLd data={schemas} />

      <Container className="max-w-3xl">
        <NewsBreadcrumb
          items={breadcrumb.map((item, index) => ({
            name: item.name,
            href: index < breadcrumb.length - 1 ? item.path : undefined,
          }))}
        />

        <div className="mt-6">
          <ArticleHeader
            category={article.categoryName}
            title={article.title}
            publishedAt={article.publishedAt}
            updatedAt={article.updatedAt}
            readingTimeMinutes={article.readingTimeMinutes}
            excerpt={article.excerpt}
          />
        </div>

        <div className="mt-5">
          <ArticleShareButtons title={article.title} />
        </div>

        <ArticleCover src={article.coverImageUrl} alt={article.title} />

        <ArticleContent html={article.content} />

        {keywords.length > 0 && (
          <div className="mt-8 border-t border-brand-line pt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Từ khóa liên quan</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.map((tagName) => (
                <span
                  key={tagName}
                  className="rounded-full border border-brand-line px-3 py-1 text-xs font-bold text-brand-muted"
                >
                  #{tagName}
                </span>
              ))}
            </div>
          </div>
        )}

        <ArticleStoreInfo brand={brand} />

        <ArticleAdjacentNav newer={adjacentArticles.newer} older={adjacentArticles.older} />

        <RelatedArticles articles={relatedArticles} />
      </Container>
    </section>
    </>
  );
}
