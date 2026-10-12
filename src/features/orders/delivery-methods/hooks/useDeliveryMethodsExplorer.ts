"use client";

import { useCallback, useEffect, useState } from "react";

import { deleteDeliveryMethod, listDeliveryMethods } from "../services/delivery-method.service";
import type { ManagedDeliveryMethod } from "../types/delivery-method.types";

export function useDeliveryMethodsExplorer() {
  const [methods, setMethods] = useState<ManagedDeliveryMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listDeliveryMethods();
      setMethods(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  async function handleDelete(method: ManagedDeliveryMethod) {
    await deleteDeliveryMethod(method.id);
    await loadMethods();
  }

  return { rows: methods, isLoading, handleDelete };
}
