"use client";

import { getPageById } from "@/features/content/pages";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

import type { ManagedPageSection } from "../types/page-section.types";
import { getPageSlotTemplates } from "../types/page-templates";
import {
  deleteSection,
  listSectionsByPageId,
  reorderSections,
  updateSection,
} from "../services/page-section.service";

type UsePageSectionsExplorerParams = {
  pageId: string;
};

export function usePageSectionsExplorer({ pageId }: UsePageSectionsExplorerParams) {
  const sections = useAsyncData(() => listSectionsByPageId(pageId), [pageId], {
    fallbackError: "Không thể tải danh sách section.",
  });
  const page = useAsyncData(() => getPageById(pageId), [pageId], { fallbackError: "Không thể tải page." });

  const rows = sections.data ?? [];
  const slotTemplates = getPageSlotTemplates(page.data?.pageKey);
  /** Ô của trang chưa có section nào → Site đang không hiển thị ô đó (khối lõi vẫn hiện nên không tính). */
  const missingSlots = slotTemplates.filter(
    (slot) => !slot.isCore && !rows.some((row) => row.sectionKey === slot.key),
  );

  function getSlotLabel(section: ManagedPageSection): string | null {
    return slotTemplates.find((slot) => slot.key === section.sectionKey)?.label ?? null;
  }

  async function handleDelete(section: ManagedPageSection) {
    await deleteSection(pageId, section.id);
    await sections.reload();
  }

  /** Đổi chỗ với section liền kề rồi lưu cả thứ tự trong 1 request (Backend đánh lại thứ tự trong 1 transaction). */
  async function moveSection(section: ManagedPageSection, direction: "up" | "down") {
    const sectionIds = rows.map((row) => row.id);
    const index = sectionIds.indexOf(section.id);
    const neighborIndex = direction === "up" ? index - 1 : index + 1;

    if (index === -1 || neighborIndex < 0 || neighborIndex >= sectionIds.length) {
      return;
    }

    [sectionIds[index], sectionIds[neighborIndex]] = [sectionIds[neighborIndex], sectionIds[index]];
    await reorderSections(pageId, sectionIds);
    await sections.reload();
  }

  function handleMoveUp(section: ManagedPageSection) {
    return moveSection(section, "up");
  }

  function handleMoveDown(section: ManagedPageSection) {
    return moveSection(section, "down");
  }

  async function handleToggleVisible(section: ManagedPageSection) {
    const { id, ...rest } = section;
    await updateSection(id, { ...rest, isVisible: !section.isVisible });
    await sections.reload();
  }

  return {
    rows,
    pageName: page.data?.name ?? "",
    hasSlotTemplate: slotTemplates.length > 0,
    missingSlots,
    getSlotLabel,
    isLoading: sections.isLoading || page.isLoading,
    loadError: sections.error ?? page.error,
    handleDelete,
    handleMoveUp,
    handleMoveDown,
    handleToggleVisible,
  };
}
