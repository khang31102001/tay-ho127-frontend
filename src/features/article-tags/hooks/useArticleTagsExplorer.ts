"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedArticleTag } from "../types/article-tag.types";
import { deleteArticleTag, listArticleTags } from "../services/article-tag.service";

export function useArticleTagsExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listArticleTags, [], {
    fallbackError: "Không thể tải danh sách thẻ.",
  });

  async function handleDelete(tag: ManagedArticleTag) {
    await deleteArticleTag(tag.id);
    await reload();
  }

  return {
    rows: data ?? [],
    isLoading,
    loadError: error,
    handleDelete,
  };
}
