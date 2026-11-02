"use client";

import { useEffect, useState } from "react";

import { getPageById } from "@/features/content/pages";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { useNavigationRouter } from "@/providers/navigation-loading-provider";

import { listMedia } from "@/features/media";

import type { PageSectionUpsertInput } from "../services/page-section.service";
import {
  createSection,
  deleteSection,
  getSectionById,
  listSectionsByPageId,
  updateSection,
} from "../services/page-section.service";
import { getPageSlotTemplates } from "../types/page-templates";

export type PageSectionFormValue = PageSectionUpsertInput;

type UsePageSectionEditorParams = {
  pageId: string;
  id?: string;
  /** Tạo mới cho 1 ô của trang (từ danh sách "Ô chưa có nội dung"). */
  initialSlotKey?: string;
};

function buildEmptyForm(pageId: string, nextDisplayOrder: number): PageSectionFormValue {
  return {
    pageId,
    sectionKey: null,
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
    galleryMediaIds: [],
    items: [],
  };
}

export function usePageSectionEditor({ pageId, id, initialSlotKey }: UsePageSectionEditorParams) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<PageSectionFormValue>(buildEmptyForm(pageId, 1));
  const mediaOptionsData = useAsyncData(listMedia, [], { fallbackError: "Không thể tải thư viện media." });
  const page = useAsyncData(() => getPageById(pageId), [pageId], { fallbackError: "Không thể tải page." });
  const existing = useAsyncData(() => getSectionById(pageId, id ?? ""), [pageId, id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải section.",
  });
  // Các section khác của page: gợi ý thứ tự khi tạo mới + biết ô nào đã có section.
  const siblings = useAsyncData(() => listSectionsByPageId(pageId), [pageId], {
    fallbackError: "Không thể tải danh sách section.",
  });

  const slotTemplates = getPageSlotTemplates(page.data?.pageKey);
  const takenSlotKeys = (siblings.data ?? [])
    .filter((section) => section.id !== id && section.sectionKey)
    .map((section) => section.sectionKey as string);
  const currentSlot = slotTemplates.find((slot) => slot.key === form.sectionKey) ?? null;

  useEffect(() => {
    if (isEditMode || !siblings.data || !page.data) return;

    const maxOrder = siblings.data.reduce((max, section) => Math.max(max, section.displayOrder), 0);
    const emptyForm = buildEmptyForm(pageId, maxOrder + 10);
    const slot = getPageSlotTemplates(page.data.pageKey).find((item) => item.key === initialSlotKey);
    setForm(slot ? { ...emptyForm, sectionKey: slot.key, sectionType: slot.sectionType } : emptyForm);
  }, [siblings.data, page.data, pageId, isEditMode, initialSlotKey]);

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

  /** Chọn ô trên trang: loại section đi theo ô (Site render ô theo đúng loại đó). null = section tự do. */
  function selectSlot(slotKey: string | null) {
    const slot = slotTemplates.find((item) => item.key === slotKey);
    setForm((previous) => ({
      ...previous,
      sectionKey: slot?.key ?? null,
      sectionType: slot?.sectionType ?? previous.sectionType,
    }));
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
    selectSlot,
    slotTemplates,
    takenSlotKeys,
    currentSlot,
    mediaOptions: mediaOptionsData.data ?? [],
    isLoading: existing.isLoading || page.isLoading,
    loadError: existing.error ?? siblings.error ?? page.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
