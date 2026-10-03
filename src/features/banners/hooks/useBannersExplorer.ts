"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedBanner } from "../types/banner.types";
import { deleteBanner, listBanners } from "../services/banner.service";

export function useBannersExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listBanners, [], {
    fallbackError: "Không thể tải danh sách banner.",
  });

  async function handleDelete(banner: ManagedBanner) {
    await deleteBanner(banner.id);
    await reload();
  }

  return {
    rows: data ?? [],
    isLoading,
    loadError: error,
    handleDelete,
  };
}
