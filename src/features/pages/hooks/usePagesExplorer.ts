"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedPage } from "../types/page.types";
import { deletePage, listPages } from "../services/page.service";

export function usePagesExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listPages, [], {
    fallbackError: "Không thể tải danh sách page.",
  });

  async function handleDelete(page: ManagedPage) {
    await deletePage(page.id);
    await reload();
  }

  return {
    rows: data ?? [],
    isLoading,
    loadError: error,
    handleDelete,
  };
}
