"use client";

import { useCallback, useEffect, useState } from "react";

import type { ManagedBanner } from "../types/banner.types";
import { deleteBanner, listBanners } from "../services/banner.service";

export function useBannersExplorer() {
  const [banners, setBanners] = useState<ManagedBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBanners = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listBanners();
      setBanners(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  async function handleDelete(banner: ManagedBanner) {
    await deleteBanner(banner.id);
    await loadBanners();
  }

  return {
    rows: banners,
    isLoading,
    handleDelete,
  };
}
