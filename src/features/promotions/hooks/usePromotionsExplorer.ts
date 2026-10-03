"use client";

import { useMemo } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedPromotion } from "../types/promotion.types";
import { deletePromotion, listPromotions, resolvePromotionEffectiveStatus } from "../services/promotion.service";

export type PromotionRow = ManagedPromotion & { effectiveStatus: ManagedPromotion["status"] };

export function usePromotionsExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listPromotions, [], {
    fallbackError: "Không thể tải danh sách mã giảm giá.",
  });

  const rows = useMemo<PromotionRow[]>(
    () =>
      (data ?? []).map((promotion) => ({
        ...promotion,
        effectiveStatus: resolvePromotionEffectiveStatus(promotion),
      })),
    [data],
  );

  async function handleDelete(promotion: ManagedPromotion) {
    await deletePromotion(promotion.id);
    await reload();
  }

  return {
    rows,
    isLoading,
    loadError: error,
    handleDelete,
  };
}
