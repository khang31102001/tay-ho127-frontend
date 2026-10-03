"use client";

import { useEffect, useState } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import type { ManagedArticleTag } from "../types/article-tag.types";
import {
  createArticleTag,
  deleteArticleTag,
  getArticleTagById,
  updateArticleTag,
} from "../services/article-tag.service";

export type ArticleTagFormValue = Omit<ManagedArticleTag, "id">;

const EMPTY_FORM: ArticleTagFormValue = {
  name: "",
  slug: "",
};

type UseArticleTagEditorParams = {
  id?: string;
};

export function useArticleTagEditor({ id }: UseArticleTagEditorParams) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<ArticleTagFormValue>(EMPTY_FORM);
  const existing = useAsyncData(() => getArticleTagById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải thẻ bài viết.",
  });

  useEffect(() => {
    if (!existing.data) return;
    const { name, slug } = existing.data;
    setForm({ name, slug });
  }, [existing.data]);

  function updateField<K extends keyof ArticleTagFormValue>(field: K, value: ArticleTagFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isEditMode) {
      await updateArticleTag(id, form);
    } else {
      await createArticleTag(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteArticleTag(id);
    }
  }

  function goToExplore() {
    router.push("/admin/content/article-tags");
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
