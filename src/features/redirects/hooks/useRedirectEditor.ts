"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import type { RedirectFormValue } from "../types/redirect.types";
import {
  createRedirect,
  deleteRedirect,
  getRedirectById,
  isSourcePathTaken,
  updateRedirect,
} from "../services/redirect.service";

const EMPTY_FORM: RedirectFormValue = {
  sourcePath: "",
  destinationUrl: "",
  redirectType: 301,
  isActive: true,
};

type UseRedirectEditorParams = {
  id?: string;
};

export function useRedirectEditor({ id }: UseRedirectEditorParams) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<RedirectFormValue>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSourcePathAvailable, setIsSourcePathAvailable] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getRedirectById(id).then((redirect) => {
      if (isCancelled) return;

      if (redirect) {
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = redirect;
        setForm(rest);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  useEffect(() => {
    if (!form.sourcePath.trim()) {
      setIsSourcePathAvailable(undefined);
      return;
    }

    let isCancelled = false;

    isSourcePathTaken(form.sourcePath, id).then((taken) => {
      if (!isCancelled) {
        setIsSourcePathAvailable(!taken);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [form.sourcePath, id]);

  function updateField<K extends keyof RedirectFormValue>(field: K, value: RedirectFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isSourcePathAvailable === false) {
      throw new Error("Source path này đã được dùng cho 1 redirect khác.");
    }

    if (form.sourcePath.trim() === form.destinationUrl.trim()) {
      throw new Error("Source path và Destination URL không được trùng nhau (tạo vòng lặp redirect).");
    }

    if (isEditMode) {
      await updateRedirect(id, form);
    } else {
      await createRedirect(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteRedirect(id);
    }
  }

  function goToExplore() {
    router.push("/admin/seo/redirects");
  }

  return {
    form,
    updateField,
    isLoading,
    isEditMode,
    isSourcePathAvailable,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
