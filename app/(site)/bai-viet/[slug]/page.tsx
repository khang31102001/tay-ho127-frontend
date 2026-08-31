import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { sanitizeHtml } from "@/lib/sanitize-html";
// Import thẳng service — lý do xem app/(site)/bai-viet/page.tsx.
import { getArticleBySlug } from "@/features/articles/services/article.service";
import { listMedia } from "@/features/media/services/media.service";
import { listArticleCategories } from "@/features/article-categories/services/article-category.service";
import { listArticleTags } from "@/features/article-tags/services/article-tag.service";
import { buildMetadata } from "@/lib/seo/build-metadata";
import { resolveSeoPayload } from "@/lib/seo/resolve-seo-payload";

type ArticleDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const seoPayload = await resolveSeoPayload({
    // TEMPORARY CONTRACT: endpoint đề xuất cho khi có Backend ASP.NET Core thật.
    endpoint: `/articles/${params.slug}/seo`,
    mockResolver: async () => {
      const article = await getArticleBySlug(params.slug);
      if (!article) return null;

      const media = article.featuredMediaId ? (await listMedia()).find((item) => item.id === article.featuredMediaId) : undefined;

      return {
        title: article.title,
        description: article.summary,
        path: `/bai-viet/${params.slug}`,
        image: media?.url,
        type: "article",
        publishedTime: article.publishedAt,
        // Bài chưa publish vẫn xem preview được (xem banner "Xem trước" bên
        // dưới) nhưng không nên lộ ra kết quả tìm kiếm.
        noindex: article.status !== "published",
      };
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
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const [mediaList, categories, tags] = await Promise.all([
    listMedia(),
    listArticleCategories(),
    listArticleTags(),
  ]);

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

  return (
    <section className="section-padding">
      <Container className="max-w-3xl">
        <Link
          href="/bai-viet"
          className="focus-ring inline-flex items-center gap-1.5 rounded-full text-sm font-bold text-brand-green transition hover:opacity-80"
        >
          <ChevronLeft size={18} />
          Quay lại Bài viết
        </Link>

        {article.status !== "published" && (
          <p className="mt-4 rounded-lg border border-dashed border-brand-red/40 bg-brand-red/5 px-4 py-2 text-sm font-bold text-brand-red">
            Xem trước — bài viết này chưa được xuất bản công khai.
          </p>
        )}

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
