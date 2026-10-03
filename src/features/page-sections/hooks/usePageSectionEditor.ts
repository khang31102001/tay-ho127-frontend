"use client";

import { useEffect, useState } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

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
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<PageSectionFormValue>(buildEmptyForm(pageId, 1));
  const mediaOptionsData = useAsyncData(listMedia, [], { fallbackError: "Không thể tải thư viện media." });
  const existing = useAsyncData(() => getSectionById(pageId, id ?? ""), [pageId, id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải section.",
  });
  // Chế độ tạo mới: gợi ý displayOrder = lớn nhất hiện có + 1.
  const siblings = useAsyncData(() => listSectionsByPageId(pageId), [pageId], {
    enabled: !isEditMode,
    fallbackError: "Không thể tải danh sách section.",
  });

  useEffect(() => {
    if (isEditMode || !siblings.data) return;

    const maxOrder = siblings.data.reduce((max, section) => Math.max(max, section.displayOrder), 0);
    setForm(buildEmptyForm(pageId, maxOrder + 1));
  }, [siblings.data, pageId, isEditMode]);

  useEffect(() => {
    if (!existing.data) return;

    const { id: _sectionId, ...rest } = existing.data;
    setForm(rest);
  }, [existing.data]);

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
      await deleteSection(pageId, id);
    }
  }

  function goToExplore() {
    router.push(`/admin/content/pages/${pageId}/sections`);
  }

  return {
    form,
    updateField,
    mediaOptions: mediaOptionsData.data ?? [],
    isLoading: existing.isLoading,
    loadError: existing.error ?? siblings.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
