"use client";

import { useCallback, useEffect, useState } from "react";

import { deletePaymentMethod, listPaymentMethods } from "../services/payment-method.service";
import type { ManagedPaymentMethod } from "../types/payment-method.types";

export function usePaymentMethodsExplorer() {
  const [methods, setMethods] = useState<ManagedPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listPaymentMethods();
      setMethods(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  async function handleDelete(method: ManagedPaymentMethod) {
    await deletePaymentMethod(method.id);
    await loadMethods();
  }

  return { rows: methods, isLoading, handleDelete };
}
