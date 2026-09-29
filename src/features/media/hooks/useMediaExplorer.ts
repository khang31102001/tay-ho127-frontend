"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedMedia } from "../types/media.types";
import { deleteLibraryMedia, listLibraryMedia } from "../services/media-library.service";

export function useMediaExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listLibraryMedia, [], {
    fallbackError: "Không thể tải thư viện media.",
  });

  async function handleDelete(media: ManagedMedia) {
    await deleteLibraryMedia(media.id);
    await reload();
  }

  return { mediaItems: data ?? [], isLoading, loadError: error, handleDelete };
}
