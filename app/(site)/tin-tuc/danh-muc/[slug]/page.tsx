import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { cn } from "@/core/utils/cn";
import { Container } from "@/shared/ui/Container";
import {
  NewsBreadcrumb,
  NewsGrid,
  NewsHero,
  filterArticlesInCategory,
  listNewsArticles,
  listNewsCategories,
} from "@/features/content/news";
import { buildMetadata } from "@/features/seo/utils/build-metadata";

type NewsCategoryPageProps = {
  params: { slug: string };
};

async function findCategory(slug: string) {
  const categories = await listNewsCategories();
  return { categories, category: categories.find((item) => item.slug === slug) ?? null };
}

export async function generateMetadata({ params }: NewsCategoryPageProps): Promise<Metadata> {
  const { category } = await findCategory(params.slug);
  const path = `/tin-tuc/danh-muc/${params.slug}`;

  if (!category) {
    return buildMetadata({
      title: "Không tìm thấy danh mục",
      description: "Danh mục tin tức này không tồn tại hoặc đã ngừng hiển thị.",
      path,
      noindex: true,
    });
  }

  return buildMetadata({
    title: `${category.name} - Tin tức`,
    description: `Bài viết thuộc chuyên mục ${category.name} của Bánh Cuốn Tây Hồ 127.`,
    path,
  });
}

/** Trang chuyên mục: toàn bộ bài của danh mục (gồm danh mục con), mới nhất trước. */
export default async function NewsCategoryPage({ params }: NewsCategoryPageProps) {
  const [{ categories, category }, articles] = await Promise.all([findCategory(params.slug), listNewsArticles()]);

  if (!category) {
    notFound();
  }

  const categoryArticles = filterArticlesInCategory(articles, categories, category);
  const topCategories = categories.filter((item) => item.parentId === null);

  return (
    <>
      <NewsHero badge="Chuyên mục" title={category.name} description="" />

      <section className="section-padding">
        <Container>
          <NewsBreadcrumb
            items={[
              { name: "Trang chủ", href: "/" },
              { name: "Tin tức", href: "/tin-tuc" },
              { name: category.name },
            ]}
          />

          {topCategories.length > 1 && (
            <nav aria-label="Chuyên mục tin tức" className="mt-6 flex flex-wrap gap-2">
              {topCategories.map((item) => (
                <Link
                  key={item.id}
                  href={`/tin-tuc/danh-muc/${item.slug}`}
                  aria-current={item.id === category.id ? "page" : undefined}
                  className={cn(
                    "focus-ring rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition",
                    item.id === category.id
                      ? "border-brand-red bg-brand-red text-white"
                      : "border-brand-line bg-white text-brand-muted hover:border-brand-red hover:text-brand-red",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          <NewsGrid
            articles={categoryArticles}
            className="mt-8"
            emptyMessage="Chuyên mục này chưa có bài viết nào."
          />
        </Container>
      </section>
    </>
  );
}
