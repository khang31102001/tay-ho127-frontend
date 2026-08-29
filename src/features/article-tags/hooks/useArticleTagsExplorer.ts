"use client";

import { useCallback, useEffect, useState } from "react";

import type { ManagedArticleTag } from "../types/article-tag.types";
import { deleteArticleTag, listArticleTags } from "../services/article-tag.service";

export function useArticleTagsExplorer() {
  const [tags, setTags] = useState<ManagedArticleTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTags = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listArticleTags();
      setTags(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  async function handleDelete(tag: ManagedArticleTag) {
    await deleteArticleTag(tag.id);
    await loadTags();
  }

  return {
    rows: tags,
    isLoading,
    handleDelete,
  };
}
