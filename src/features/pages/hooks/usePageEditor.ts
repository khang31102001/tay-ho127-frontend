"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { PageUpsertInput } from "../services/page.service";
import {
  createPage,
  deletePage,
  getPageById,
  isSlugTaken,
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
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<PageFormValue>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getPageById(id).then((page) => {
      if (isCancelled) {
        return;
      }

      if (page) {
        setForm({ name: page.name, slug: page.slug, status: page.status });
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  useEffect(() => {
    if (!form.slug) {
      setIsSlugAvailable(undefined);
      return;
    }

    let isCancelled = false;

    isSlugTaken(form.slug, id).then((taken) => {
      if (!isCancelled) {
        setIsSlugAvailable(!taken);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [form.slug, id]);

  function updateField<K extends keyof PageFormValue>(field: K, value: PageFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isSlugAvailable === false) {
      throw new Error("Đường dẫn (slug) đã được dùng cho page khác.");
    }

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
    isLoading,
    isEditMode,
    isSlugAvailable,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
