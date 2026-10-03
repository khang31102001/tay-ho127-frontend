"use client";

import { getPageById } from "@/features/pages";
import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedPageSection } from "../types/page-section.types";
import {
  deleteSection,
  listSectionsByPageId,
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

  async function handleDelete(section: ManagedPageSection) {
    await deleteSection(pageId, section.id);
    await sections.reload();
  }

  /** Đổi chỗ displayOrder với section liền kề — không cần API reorder riêng. */
  async function swapWithNeighbor(section: ManagedPageSection, direction: "up" | "down") {
    const index = rows.findIndex((item) => item.id === section.id);
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    const neighbor = rows[neighborIndex];

    if (!neighbor) {
      return;
    }

    const { id: sectionId, ...sectionRest } = section;
    const { id: neighborId, ...neighborRest } = neighbor;

    await Promise.all([
      updateSection(sectionId, { ...sectionRest, displayOrder: neighbor.displayOrder }),
      updateSection(neighborId, { ...neighborRest, displayOrder: section.displayOrder }),
    ]);

    await sections.reload();
  }

  function handleMoveUp(section: ManagedPageSection) {
    return swapWithNeighbor(section, "up");
  }

  function handleMoveDown(section: ManagedPageSection) {
    return swapWithNeighbor(section, "down");
  }

  return {
    rows,
    pageName: page.data?.name ?? "",
    isLoading: sections.isLoading || page.isLoading,
    loadError: sections.error ?? page.error,
    handleDelete,
    handleMoveUp,
    handleMoveDown,
  };
}
