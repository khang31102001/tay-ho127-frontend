"use client";

import { useCallback, useEffect, useState } from "react";

import type { ManagedMedia } from "../types/media.types";
import { deleteMedia, listMedia } from "../services/media.service";

export function useMediaExplorer() {
  const [mediaItems, setMediaItems] = useState<ManagedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMedia = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listMedia();
      setMediaItems(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  async function handleDelete(media: ManagedMedia) {
    await deleteMedia(media.id);
    await loadMedia();
  }

  return {
    mediaItems,
    isLoading,
    handleDelete,
  };
}
