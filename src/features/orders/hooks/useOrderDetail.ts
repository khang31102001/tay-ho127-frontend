"use client";

import { useCallback, useEffect, useState } from "react";
import { getOrderById, updateOrderStatus } from "../services/order.service";
import type { OrderStatus } from "../types/order-status";
import type { ManagedOrder } from "../types/order.types";

const ADMIN_ACTOR = "Admin";

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<ManagedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    const data = await getOrderById(orderId);
    setOrder(data ?? null);
    setIsLoading(false);
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleTransition = useCallback(
    async (toStatus: OrderStatus, note?: string) => {
      setIsUpdating(true);
      try {
        const updated = await updateOrderStatus(orderId, toStatus, ADMIN_ACTOR, note);
        setOrder(updated);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật trạng thái đơn hàng.");
      } finally {
        setIsUpdating(false);
      }
    },
    [orderId],
  );

  return {
    order,
    isLoading,
    isUpdating,
    errorMessage,
    clearError: () => setErrorMessage(null),
    handleTransition,
  };
}
