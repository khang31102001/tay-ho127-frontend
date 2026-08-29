"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedMedia } from "@/features/media";
import { listMedia } from "@/features/media";

import type { PageSectionUpsertInput } from "../services/page-section.service";
import {
  createSection,
  deleteSection,
  getSectionById,
  listSectionsByPageId,
  updateSection,
} from "../services/page-section.service";

export type PageSectionFormValue = PageSectionUpsertInput;

type UsePageSectionEditorParams = {
  pageId: string;
  id?: string;
};

function buildEmptyForm(pageId: string, nextDisplayOrder: number): PageSectionFormValue {
  return {
    pageId,
    sectionType: "introduction",
    eyebrow: "",
    heading: "",
    subheading: "",
    body: "",
    mediaId: null,
    ctaLabel: "",
    ctaUrl: "",
    displayOrder: nextDisplayOrder,
    isVisible: true,
  };
}

export function usePageSectionEditor({ pageId, id }: UsePageSectionEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<PageSectionFormValue>(buildEmptyForm(pageId, 1));
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    listMedia().then(setMediaOptions);
  }, []);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    listSectionsByPageId(pageId).then((sections) => {
      const maxOrder = sections.reduce((max, section) => Math.max(max, section.displayOrder), 0);
      setForm(buildEmptyForm(pageId, maxOrder + 1));
    });
  }, [pageId, isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getSectionById(id).then((section) => {
      if (isCancelled) {
        return;
      }

      if (section) {
        const { id: _sectionId, ...rest } = section;
        setForm(rest);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof PageSectionFormValue>(
    field: K,
    value: PageSectionFormValue[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isEditMode) {
      await updateSection(id, form);
    } else {
      await createSection(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteSection(id);
    }
  }

  function goToExplore() {
    router.push(`/admin/content/pages/${pageId}/sections`);
  }

  return {
    form,
    updateField,
    mediaOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
