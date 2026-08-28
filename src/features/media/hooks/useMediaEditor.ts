"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedMedia } from "../types/media.types";
import {
  createMedia,
  deleteMedia,
  getMediaById,
  updateMedia,
} from "../services/media.service";

export type MediaFormValue = Omit<ManagedMedia, "id">;

const EMPTY_FORM: MediaFormValue = {
  fileName: "",
  url: "",
  type: "image",
  altText: "",
  size: 0,
  status: "active",
};

type UseMediaEditorParams = {
  id?: string;
};

export function useMediaEditor({ id }: UseMediaEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<MediaFormValue>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getMediaById(id).then((media) => {
      if (isCancelled) {
        return;
      }

      if (media) {
        setForm(media);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof MediaFormValue>(field: K, value: MediaFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isEditMode) {
      await updateMedia(id, form);
    } else {
      await createMedia(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteMedia(id);
    }
  }

  function goToExplore() {
    router.push("/admin/catalog/media");
  }

  return {
    form,
    updateField,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
