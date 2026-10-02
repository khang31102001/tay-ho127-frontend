"use client";

import { useCallback, useEffect, useState } from "react";

import type { ManagedRedirect } from "../types/redirect.types";
import { deleteRedirect, listRedirects } from "../services/redirect.service";

export function useRedirectsExplorer() {
  const [redirects, setRedirects] = useState<ManagedRedirect[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listRedirects();
      setRedirects(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(redirect: ManagedRedirect) {
    await deleteRedirect(redirect.id);
    await load();
  }

  return { redirects, isLoading, handleDelete };
}
