"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaymentStatus } from "@/features/orders";

import { getPaymentById, transitionPayment } from "../services/payment.service";
import { listTransactionsByPaymentId } from "../services/payment-transaction.service";
import type { ManagedPaymentTransaction } from "../types/payment-transaction.types";
import type { ManagedPayment } from "../types/payment.types";

const ADMIN_ACTOR = "Admin";

export function usePaymentDetail(paymentId: string) {
  const [payment, setPayment] = useState<ManagedPayment | null>(null);
  const [transactions, setTransactions] = useState<ManagedPaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPayment = useCallback(async () => {
    setIsLoading(true);
    const data = await getPaymentById(paymentId);
    setPayment(data ?? null);
    if (data) {
      setTransactions(await listTransactionsByPaymentId(paymentId));
    }
    setIsLoading(false);
  }, [paymentId]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  const handleTransition = useCallback(
    async (toStatus: PaymentStatus, note?: string) => {
      setIsUpdating(true);
      try {
        const updated = await transitionPayment(paymentId, toStatus, ADMIN_ACTOR, note);
        setPayment(updated);
        setTransactions(await listTransactionsByPaymentId(paymentId));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật trạng thái thanh toán.");
      } finally {
        setIsUpdating(false);
      }
    },
    [paymentId],
  );

  return {
    payment,
    transactions,
    isLoading,
    isUpdating,
    errorMessage,
    clearError: () => setErrorMessage(null),
    handleTransition,
  };
}
