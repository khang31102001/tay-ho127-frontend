"use client";

import { useCallback } from "react";

import type { DataExplorerLoadPage } from "@/shared/admin/templates/DataExplorer/DataExplorer";

import type { ManagedMedia } from "../types/media.types";
import { deleteLibraryMedia, listLibraryMediaPage } from "../services/media-library.service";

/** Tải theo trang từ Backend (10 file/lượt). Sau khi xóa, DataExplorer tự tải lại từ trang đầu. */
export function useMediaExplorer() {
  const loadPage = useCallback<DataExplorerLoadPage<ManagedMedia>>(async (query, signal) => {
    const page = await listLibraryMediaPage(query, signal);
    return { items: page.items, totalItems: page.totalItems };
  }, []);

  async function handleDelete(media: ManagedMedia) {
    await deleteLibraryMedia(media.id);
  }

  return { loadPage, handleDelete };
}
