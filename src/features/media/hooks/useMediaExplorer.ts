"use client";

import { useCallback, useState } from "react";

import type { DataExplorerLoadPage } from "@/shared/admin/templates/DataExplorer/DataExplorer";

import type { ManagedMedia } from "../types/media.types";
import {
  deleteLibraryMedia,
  listLibraryMediaPage,
  type LibraryMediaStatusFilter,
} from "../services/media-library.service";

/** Tải theo trang từ Backend (10 file/lượt). Sau khi xóa, DataExplorer tự tải lại từ trang đầu. */
export function useMediaExplorer() {
  const [statusFilter, setStatusFilter] = useState<LibraryMediaStatusFilter>("all");
  // Tăng sau khi xóa vĩnh viễn hàng loạt: đổi identity của loadPage = DataExplorer tải lại từ trang 1.
  const [reloadKey, setReloadKey] = useState(0);

  const loadPage = useCallback<DataExplorerLoadPage<ManagedMedia>>(
    async (query, signal) => {
      const page = await listLibraryMediaPage({ ...query, status: statusFilter }, signal);
      return { items: page.items, totalItems: page.totalItems };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reloadKey chỉ để đổi identity, buộc tải lại.
    [statusFilter, reloadKey],
  );

  async function handleDelete(media: ManagedMedia) {
    await deleteLibraryMedia(media.id);
  }

  function reload() {
    setReloadKey((previous) => previous + 1);
  }

  return { loadPage, handleDelete, statusFilter, setStatusFilter, reload };
}
