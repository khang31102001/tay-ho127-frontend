"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import type { ManagedMedia } from "@/features/media";
import { listMedia } from "@/features/media";

import type { SeoEntityType } from "../types/seo-metadata.types";
import type { ManagedSeoSettings } from "../types/seo-settings.types";
import { getSeoSettings } from "../services/seo-settings.service";
import { getSeoDirectoryEntry, type SeoDirectoryEntry } from "../utils/seo-entity-directory";
import { useSeoMetadataForm } from "./useSeoMetadataForm";

type UseSeoEditorPageParams = {
  entityType: SeoEntityType;
  entityId: string | null;
};

/**
 * Hook cho màn hình Sửa SEO ĐỨNG RIÊNG (Admin > SEO > Metadata > Sửa) — resolve
 * entity thật (Product/Category/Article/Homepage) từ URL để lấy Entity Default,
 * rồi giao cho useSeoMetadataForm quản lý override. Product/Category/Article
 * Editor KHÔNG dùng hook này — chúng đã có sẵn entity data, chỉ dùng thẳng
 * useSeoMetadataForm + tự truyền entityDefaults (xem ProductEditor.tsx).
 */
export function useSeoEditorPage({ entityType, entityId }: UseSeoEditorPageParams) {
  const router = useNavigationRouter();

  const [entry, setEntry] = useState<SeoDirectoryEntry | null>(null);
  const [settings, setSettings] = useState<ManagedSeoSettings | null>(null);
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [isEntryLoading, setIsEntryLoading] = useState(true);

  const seoForm = useSeoMetadataForm(entityType, entityId);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([getSeoDirectoryEntry(entityType, entityId), getSeoSettings(), listMedia()]).then(
      ([foundEntry, seoSettings, media]) => {
        if (isCancelled) return;
        setEntry(foundEntry);
        setSettings(seoSettings);
        setMediaOptions(media);
        setIsEntryLoading(false);
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [entityType, entityId]);

  function goToExplore() {
    router.push("/admin/seo/metadata");
  }

  return {
    entry,
    settings,
    mediaOptions,
    goToExplore,
    ...seoForm,
    isLoading: isEntryLoading || seoForm.isLoading,
  };
}
