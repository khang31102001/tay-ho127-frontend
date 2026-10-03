"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ManagedPromotion } from "../types/promotion.types";
import { deletePromotion, listPromotions, resolvePromotionEffectiveStatus } from "../services/promotion.service";

export type PromotionRow = ManagedPromotion & { effectiveStatus: ManagedPromotion["status"] };

export function usePromotionsExplorer() {
  const [promotions, setPromotions] = useState<ManagedPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPromotions = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listPromotions();
      setPromotions(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const rows = useMemo<PromotionRow[]>(
    () => promotions.map((promotion) => ({ ...promotion, effectiveStatus: resolvePromotionEffectiveStatus(promotion) })),
    [promotions],
  );

  async function handleDelete(promotion: ManagedPromotion) {
    await deletePromotion(promotion.id);
    await loadPromotions();
  }

  return {
    rows,
    isLoading,
    handleDelete,
  };
}
