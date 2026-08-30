"use client";

import { useCallback, useEffect, useState } from "react";

import { getPageById } from "@/features/pages";

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
  const [sections, setSections] = useState<ManagedPageSection[]>([]);
  const [pageName, setPageName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSections = useCallback(async () => {
    setIsLoading(true);

    try {
      const [sectionData, page] = await Promise.all([
        listSectionsByPageId(pageId),
        getPageById(pageId),
      ]);

      setSections(sectionData);
      setPageName(page?.name ?? "");
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  async function handleDelete(section: ManagedPageSection) {
    await deleteSection(section.id);
    await loadSections();
  }

  /** Đổi chỗ displayOrder với section liền kề — không cần API reorder riêng. */
  async function swapWithNeighbor(section: ManagedPageSection, direction: "up" | "down") {
    const index = sections.findIndex((item) => item.id === section.id);
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    const neighbor = sections[neighborIndex];

    if (!neighbor) {
      return;
    }

    const { id: sectionId, ...sectionRest } = section;
    const { id: neighborId, ...neighborRest } = neighbor;

    await Promise.all([
      updateSection(sectionId, { ...sectionRest, displayOrder: neighbor.displayOrder }),
      updateSection(neighborId, { ...neighborRest, displayOrder: section.displayOrder }),
    ]);

    await loadSections();
  }

  function handleMoveUp(section: ManagedPageSection) {
    return swapWithNeighbor(section, "up");
  }

  function handleMoveDown(section: ManagedPageSection) {
    return swapWithNeighbor(section, "down");
  }

  return {
    rows: sections,
    pageName,
    isLoading,
    handleDelete,
    handleMoveUp,
    handleMoveDown,
  };
}
