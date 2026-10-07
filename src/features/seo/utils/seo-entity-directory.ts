import { listProducts, type ManagedProduct } from "@/features/products";
import { listCategories, type ManagedCategory } from "@/features/categories";
import { listArticles, type ManagedArticleListItem } from "@/features/articles";

import type { SeoEntityType } from "../types/seo-metadata.types";
import type { SeoEntityDefaults } from "../utils/resolve-seo-preview";

/**
 * Danh mục các entity "SEO-able" hiện tại — chỉ Product/Category/Article +
 * Homepage (singleton). KHÔNG gồm "page" (CMS Page) vì Storefront chưa có
 * route public nào render ManagedPage/ManagedPageSection (xem
 * seo-architecture-analysis.md mục 2.7/8.4) — thêm join Page vào đây khi route
 * đó tồn tại, không suy đoán trước.
 *
 * Product không có field `slug` riêng — `id` chính là slug trên URL (xem
 * UiProduct.slug = ManagedProduct.id trong features/menu/services/menu.service.ts).
 * Category chưa có route public riêng nên `url: null`.
 */
export type SeoDirectoryEntry = {
  entityType: SeoEntityType;
  entityId: string | null;
  label: string;
  url: string | null;
  defaults: SeoEntityDefaults;
};

function productToEntry(product: ManagedProduct): SeoDirectoryEntry {
  return {
    entityType: "product",
    entityId: product.id,
    label: product.name,
    url: `/thuc-don/${product.id}`,
    defaults: {
      title: product.name,
      description: product.description ?? "",
      imageMediaId: product.mediaIds[0] ?? null,
    },
  };
}

function categoryToEntry(category: ManagedCategory): SeoDirectoryEntry {
  return {
    entityType: "category",
    entityId: category.id,
    label: category.name,
    url: null,
    defaults: {
      title: category.name,
      description: "",
      imageMediaId: null,
    },
  };
}

function articleToEntry(article: ManagedArticleListItem): SeoDirectoryEntry {
  return {
    entityType: "article",
    entityId: article.id,
    label: article.title,
    url: `/tin-tuc/${article.slug}`,
    defaults: {
      title: article.title,
      description: article.summary,
      imageMediaId: article.featuredMediaId,
    },
  };
}

const HOMEPAGE_ENTRY: SeoDirectoryEntry = {
  entityType: "homepage",
  entityId: null,
  label: "Trang chủ",
  url: "/",
  defaults: {
    title: "Bánh Cuốn Tây Hồ 127",
    description: "",
    imageMediaId: null,
  },
};

export async function listSeoDirectory(): Promise<SeoDirectoryEntry[]> {
  const [products, categories, articles] = await Promise.all([listProducts(), listCategories(), listArticles()]);

  return [
    HOMEPAGE_ENTRY,
    ...products.map(productToEntry),
    ...categories.map(categoryToEntry),
    ...articles.map(articleToEntry),
  ];
}

export async function getSeoDirectoryEntry(
  entityType: SeoEntityType,
  entityId: string | null,
): Promise<SeoDirectoryEntry | null> {
  const entries = await listSeoDirectory();
  return entries.find((entry) => entry.entityType === entityType && entry.entityId === entityId) ?? null;
}
