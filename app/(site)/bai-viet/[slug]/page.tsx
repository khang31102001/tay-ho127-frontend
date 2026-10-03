import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { sanitizeHtml } from "@/lib/sanitize-html";
// Bài viết/danh mục/thẻ công khai lấy từ Backend (features/content-public) — lý do import
// thẳng service media xem app/(site)/bai-viet/page.tsx.
import { getPublicTaxonomy, getPublishedArticleBySlug } from "@/features/content-public";
import { listMedia } from "@/features/media/services/public-media.service";
import { buildMetadata } from "@/lib/seo/build-metadata";
import { resolveSeoPayload } from "@/lib/seo/resolve-seo-payload";
// Import thẳng service (không qua barrel @/features/seo) — cùng lý do đã áp
// dụng cho @/features/media ở trên (barrel re-export cả UI Admin).
import { resolveSeoPayloadForEntity } from "@/features/seo/services/seo-resolver.service";
import { resolveArticlePageSchemas } from "@/features/seo/services/seo-schema-resolver.service";
import { JsonLd } from "@/components/shared/JsonLd";

type ArticleDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const seoPayload = await resolveSeoPayload({
    // TEMPORARY CONTRACT: endpoint đề xuất cho khi có Backend ASP.NET Core thật.
    endpoint: `/articles/${params.slug}/seo`,
    mockResolver: async () => {
      // Chỉ bài đã xuất bản (Backend trả 404 cho nháp/lưu trữ).
      const article = await getPublishedArticleBySlug(params.slug);
      if (!article) return null;

      return resolveSeoPayloadForEntity({
        entityType: "article",
        entityId: article.id,
        path: `/bai-viet/${params.slug}`,
        defaults: {
          title: article.title,
          description: article.summary,
          imageMediaId: article.featuredMediaId,
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
      path: `/bai-viet/${params.slug}`,
      noindex: true,
    });
  }

  return buildMetadata(seoPayload);
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const article = await getPublishedArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const [mediaList, { categories, tags }] = await Promise.all([listMedia(), getPublicTaxonomy()]);

  const media = article.featuredMediaId
    ? mediaList.find((item) => item.id === article.featuredMediaId)
    : undefined;
  const category = article.categoryId
    ? categories.find((item) => item.id === article.categoryId)
    : undefined;
  const articleTags = tags.filter((tag) => article.tagIds.includes(tag.id));

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  // PAGE SCHEMA (Task 22): Article + BreadcrumbList.
  const schemas = await resolveArticlePageSchemas({
    headline: article.title,
    description: article.summary,
    imageUrl: media?.url,
    path: `/bai-viet/${params.slug}`,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: article.authorName,
    breadcrumb: [
      { name: "Trang chủ", path: "/" },
      { name: "Bài viết", path: "/bai-viet" },
      { name: article.title, path: `/bai-viet/${params.slug}` },
    ],
  });

  return (
    <section className="section-padding">
      <JsonLd data={schemas} />

      <Container className="max-w-3xl">
        <Link
          href="/bai-viet"
          className="focus-ring inline-flex items-center gap-1.5 rounded-full text-sm font-bold text-brand-green transition hover:opacity-80"
        >
          <ChevronLeft size={18} />
          Quay lại Bài viết
        </Link>

        <div className="mt-6">
          {category && (
            <span className="text-xs font-bold uppercase tracking-wide text-brand-red">
              {category.name}
            </span>
          )}

          <h1 className="heading-1 mt-2 text-brand-ink">{article.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
            <span>{article.authorName}</span>
            {publishedDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>{publishedDate}</span>
              </>
            )}
          </div>
        </div>

        {media && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-card border border-brand-line bg-brand-cream">
            <Image
              src={media.url}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div
          className="prose prose-sm mt-8 max-w-none text-[15px] leading-7 text-brand-ink [&_blockquote]:border-l-4 [&_blockquote]:border-brand-line [&_blockquote]:pl-4 [&_blockquote]:text-brand-muted [&_h2]:mt-6 [&_h2]:text-[20px] [&_h2]:font-black [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
        />

        {articleTags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-brand-line pt-6">
            {articleTags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-brand-line px-3 py-1 text-xs font-bold text-brand-muted"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
