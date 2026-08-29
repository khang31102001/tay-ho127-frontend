"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { PublishStatus } from "@/components/shared/PublishStatusBadge";
import { listArticleCategories, type ManagedArticleCategory } from "@/features/article-categories";

import type { ManagedArticle } from "../types/article.types";
import { deleteArticle, listArticles } from "../services/article.service";

export type ArticleRow = ManagedArticle & { categoryName: string };

export type ArticleStatusFilter = PublishStatus | "all";

export function useArticlesExplorer() {
  const [articles, setArticles] = useState<ManagedArticle[]>([]);
  const [categories, setCategories] = useState<ManagedArticleCategory[]>([]);
  const [statusFilter, setStatusFilter] = useState<ArticleStatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);

    try {
      const [articleData, categoryData] = await Promise.all([
        listArticles(),
        listArticleCategories(),
      ]);

      setArticles(articleData);
      setCategories(categoryData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const rows = useMemo<ArticleRow[]>(() => {
    const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

    return articles
      .filter((article) => statusFilter === "all" || article.status === statusFilter)
      .map((article) => ({
        ...article,
        categoryName: article.categoryId ? categoryNameById.get(article.categoryId) ?? "—" : "—",
      }));
  }, [articles, categories, statusFilter]);

  async function handleDelete(article: ManagedArticle) {
    await deleteArticle(article.id);
    await loadArticles();
  }

  return {
    rows,
    statusFilter,
    setStatusFilter,
    isLoading,
    handleDelete,
  };
}
