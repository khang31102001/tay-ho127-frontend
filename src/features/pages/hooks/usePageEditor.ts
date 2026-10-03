"use client";

import { useEffect, useState } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import type { PageUpsertInput } from "../services/page.service";
import {
  createPage,
  deletePage,
  getPageById,
  updatePage,
} from "../services/page.service";

export type PageFormValue = PageUpsertInput;

const EMPTY_FORM: PageFormValue = {
  name: "",
  slug: "",
  status: "draft",
};

type UsePageEditorParams = {
  id?: string;
};

export function usePageEditor({ id }: UsePageEditorParams) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<PageFormValue>(EMPTY_FORM);
  const existing = useAsyncData(() => getPageById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải page.",
  });

  useEffect(() => {
    if (!existing.data) return;
    const { name, slug, status } = existing.data;
    setForm({ name, slug, status });
  }, [existing.data]);

  function updateField<K extends keyof PageFormValue>(field: K, value: PageFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isEditMode) {
      await updatePage(id, form);
    } else {
      await createPage(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deletePage(id);
    }
  }

  function goToExplore() {
    router.push("/admin/content/pages");
  }

  return {
    form,
    updateField,
    isLoading: existing.isLoading,
    loadError: existing.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
