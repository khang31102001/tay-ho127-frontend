"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/providers/navigation-loading-provider";

import type { EntityStatus } from "@/shared/admin/templates/StatusBadge";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

import type { MediaUpsertInput } from "../services/media-library.service";
import { deleteLibraryMedia, getLibraryMediaById, updateLibraryMedia } from "../services/media-library.service";

export type MediaFormValue = MediaUpsertInput;

const EMPTY_FORM: MediaFormValue = {
  fileName: "",
  url: "",
  type: "image",
  altText: "",
  size: 0,
};

type UseMediaEditorParams = {
  id: string;
};

/** Sửa một media có sẵn (metadata/URL). Thêm mới — một hay nhiều — dùng MediaBulkCreator. */
export function useMediaEditor({ id }: UseMediaEditorParams) {
  const router = useNavigationRouter();

  const [form, setForm] = useState<MediaFormValue>(EMPTY_FORM);
  const [status, setStatus] = useState<EntityStatus>("active");

  const existing = useAsyncData(() => getLibraryMediaById(id), [id], {
    fallbackError: "Không thể tải media.",
  });

  useEffect(() => {
    if (!existing.data) return;
    const { fileName, url, type, altText, size, status: currentStatus } = existing.data;
    setForm({ fileName, url, type, altText, size });
    setStatus(currentStatus);
  }, [existing.data]);

  function updateField<K extends keyof MediaFormValue>(field: K, value: MediaFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    await updateLibraryMedia(id, form);
  }

  async function handleDelete() {
    await deleteLibraryMedia(id);
  }

  function goToExplore() {
    router.push("/admin/catalog/media");
  }

  return {
    form,
    status,
    updateField,
    isLoading: existing.isLoading,
    loadError: existing.error,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
