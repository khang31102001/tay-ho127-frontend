"use client";

import { useCallback, useEffect, useState } from "react";

import type { ManagedPage } from "../types/page.types";
import { deletePage, listPages } from "../services/page.service";

export function usePagesExplorer() {
  const [pages, setPages] = useState<ManagedPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPages = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listPages();
      setPages(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  async function handleDelete(page: ManagedPage) {
    await deletePage(page.id);
    await loadPages();
  }

  return {
    rows: pages,
    isLoading,
    handleDelete,
  };
}
