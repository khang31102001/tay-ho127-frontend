"use client";

import { useMemo, useState } from "react";

import type { PublishStatus } from "@/components/shared/PublishStatusBadge";
import { listArticleCategories } from "@/features/article-categories";
import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedArticleListItem } from "../types/article.types";
import { deleteArticle, listArticles } from "../services/article.service";

export type ArticleRow = ManagedArticleListItem & { categoryName: string };

export type ArticleStatusFilter = PublishStatus | "all";

export function useArticlesExplorer() {
  const [statusFilter, setStatusFilter] = useState<ArticleStatusFilter>("all");

  const articles = useAsyncData(listArticles, [], { fallbackError: "Không thể tải danh sách bài viết." });
  const categories = useAsyncData(listArticleCategories, [], { fallbackError: "Không thể tải danh mục bài viết." });

  const rows = useMemo<ArticleRow[]>(() => {
    const categoryNameById = new Map((categories.data ?? []).map((category) => [category.id, category.name]));

    return (articles.data ?? [])
      .filter((article) => statusFilter === "all" || article.status === statusFilter)
      .map((article) => ({
        ...article,
        categoryName: article.categoryId ? categoryNameById.get(article.categoryId) ?? "—" : "—",
      }));
  }, [articles.data, categories.data, statusFilter]);

  async function handleDelete(article: ManagedArticleListItem) {
    await deleteArticle(article.id);
    await articles.reload();
  }

  return {
    rows,
    statusFilter,
    setStatusFilter,
    isLoading: articles.isLoading || categories.isLoading,
    loadError: articles.error ?? categories.error,
    handleDelete,
  };
}
