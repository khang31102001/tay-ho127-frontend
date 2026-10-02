"use client";

import { useEffect, useState } from "react";

import { listSeoMetadata } from "../services/seo-metadata.service";
import { listSeoDirectory } from "../utils/seo-entity-directory";
import { seoMetadataRowId } from "../utils/seo-metadata-key";

export type SeoDashboardStats = {
  totalEntities: number;
  withOverride: number;
  missingMetaTitle: number;
  missingMetaDescription: number;
  missingOgImage: number;
  noindexCount: number;
};

/**
 * Task 11 — Dashboard. KHÔNG có dòng thống kê "Schema đang sử dụng": module
 * Schema.org/JSON-LD (Task 6-10) chưa được triển khai ở lần này (ngoài phạm
 * vi đã xác nhận), nên không bịa số liệu cho phần chưa tồn tại.
 */
export function useSeoDashboard() {
  const [stats, setStats] = useState<SeoDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([listSeoDirectory(), listSeoMetadata()]).then(([entries, overrides]) => {
      if (isCancelled) return;

      const overrideByKey = new Map(overrides.map((row) => [seoMetadataRowId(row.entityType, row.entityId), row]));

      let withOverride = 0;
      let missingMetaTitle = 0;
      let missingMetaDescription = 0;
      let missingOgImage = 0;
      let noindexCount = 0;

      entries.forEach((entry) => {
        const override = overrideByKey.get(seoMetadataRowId(entry.entityType, entry.entityId));

        if (override) {
          withOverride += 1;
          if (!override.robotsIndex) noindexCount += 1;
        }

        const hasTitle = Boolean(override?.metaTitle) || Boolean(entry.defaults.title);
        const hasDescription = Boolean(override?.metaDescription) || Boolean(entry.defaults.description);
        const hasOgImage = Boolean(override?.ogImageMediaId) || Boolean(entry.defaults.imageMediaId);

        if (!hasTitle) missingMetaTitle += 1;
        if (!hasDescription) missingMetaDescription += 1;
        if (!hasOgImage) missingOgImage += 1;
      });

      setStats({
        totalEntities: entries.length,
        withOverride,
        missingMetaTitle,
        missingMetaDescription,
        missingOgImage,
        noindexCount,
      });
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  return { stats, isLoading };
}
