"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<ArticleTagFormValue>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getArticleTagById(id).then((tag) => {
      if (isCancelled) {
        return;
      }

      if (tag) {
        setForm(tag);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

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
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
