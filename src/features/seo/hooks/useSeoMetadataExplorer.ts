"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { SeoEntityType } from "../types/seo-metadata.types";
import { listSeoMetadata, resetSeoMetadata } from "../services/seo-metadata.service";
import { listSeoDirectory, type SeoDirectoryEntry } from "../utils/seo-entity-directory";
import { seoMetadataRowId } from "../utils/seo-metadata-key";

export type SeoMetadataRow = {
  entityType: SeoEntityType;
  entityId: string | null;
  label: string;
  url: string | null;
  metaTitle: string | null;
  robotsIndex: boolean;
  hasOverride: boolean;
  updatedAt: string | null;
};

function toRow(entry: SeoDirectoryEntry, overrideByKey: Map<string, { metaTitle: string | null; robotsIndex: boolean; updatedAt: string }>): SeoMetadataRow {
  const override = overrideByKey.get(seoMetadataRowId(entry.entityType, entry.entityId));

  return {
    entityType: entry.entityType,
    entityId: entry.entityId,
    label: entry.label,
    url: entry.url,
    metaTitle: override?.metaTitle ?? null,
    robotsIndex: override?.robotsIndex ?? true,
    hasOverride: Boolean(override),
    updatedAt: override?.updatedAt ?? null,
  };
}

export function useSeoMetadataExplorer() {
  const [directory, setDirectory] = useState<SeoDirectoryEntry[]>([]);
  const [overrides, setOverrides] = useState<Awaited<ReturnType<typeof listSeoMetadata>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entries, seoRows] = await Promise.all([listSeoDirectory(), listSeoMetadata()]);
      setDirectory(entries);
      setOverrides(seoRows);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo<SeoMetadataRow[]>(() => {
    const overrideByKey = new Map(
      overrides.map((row) => [
        seoMetadataRowId(row.entityType, row.entityId),
        { metaTitle: row.metaTitle, robotsIndex: row.robotsIndex, updatedAt: row.updatedAt },
      ]),
    );

    return directory.map((entry) => toRow(entry, overrideByKey));
  }, [directory, overrides]);

  async function handleReset(row: SeoMetadataRow) {
    await resetSeoMetadata(row.entityType, row.entityId);
    await load();
  }

  return { rows, isLoading, handleReset };
}
