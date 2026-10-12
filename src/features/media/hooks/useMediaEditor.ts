"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/providers/navigation-loading-provider";

import type { EntityStatus } from "@/shared/admin/templates/StatusBadge";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

import type { MediaUpsertInput } from "../services/media-library.service";
import { MEDIA_UPLOAD_MAX_BYTES, uploadLibraryMedia } from "../services/media-library.service";
import {
  createLibraryMedia,
  deleteLibraryMedia,
  getLibraryMediaById,
  updateLibraryMedia,
} from "../services/media-library.service";

export type MediaFormValue = MediaUpsertInput;

/** "url": nhập URL có sẵn; "upload": chọn file để Backend lưu. Sửa media luôn là "url" (không đổi file đã upload). */
export type MediaSourceMode = "url" | "upload";

const EMPTY_FORM: MediaFormValue = {
  fileName: "",
  url: "",
  type: "image",
  altText: "",
  size: 0,
};

type UseMediaEditorParams = {
  id?: string;
};

export function useMediaEditor({ id }: UseMediaEditorParams) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<MediaFormValue>(EMPTY_FORM);
  const [status, setStatus] = useState<EntityStatus>("active");
  const [sourceMode, setSourceMode] = useState<MediaSourceMode>("upload");
  const [file, setFile] = useState<File | null>(null);

  const existing = useAsyncData(() => getLibraryMediaById(id ?? ""), [id], {
    enabled: isEditMode,
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
    if (isEditMode) {
      await updateLibraryMedia(id, form);
      return;
    }

    if (sourceMode === "url") {
      await createLibraryMedia(form);
      return;
    }

    if (!file) {
      throw new Error("Vui lòng chọn file để tải lên.");
    }
    if (file.size > MEDIA_UPLOAD_MAX_BYTES) {
      throw new Error(`File vượt quá giới hạn ${MEDIA_UPLOAD_MAX_BYTES / (1024 * 1024)}MB.`);
    }

    await uploadLibraryMedia(file, form.altText);
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteLibraryMedia(id);
    }
  }

  function goToExplore() {
    router.push("/admin/catalog/media");
  }

  return {
    form,
    status,
    sourceMode,
    setSourceMode,
    file,
    setFile,
    updateField,
    isLoading: existing.isLoading,
    loadError: existing.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
