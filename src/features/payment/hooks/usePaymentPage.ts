"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/features/cart";
import {
  cancelPaymentSession,
  confirmPaymentSession,
  getPaymentSessionById,
  reportPaymentFailure,
  retryPaymentSession,
} from "../services/payment-session.service";
import type { PaymentSession } from "../types/payment.types";

/**
 * Payment Page (QR/DIGITAL_WALLET) — đọc PaymentSession theo id trên URL, xử
 * lý các hành động khách có thể làm: xác nhận đã thanh toán (tạo Order/Payment
 * thật, xem confirmPaymentSession), tự báo gặp sự cố (failed, cho thử lại),
 * hoặc huỷ để quay lại giỏ hàng. `undefined` = đang tải, `null` = không tìm
 * thấy session.
 */
export function usePaymentPage(sessionId: string) {
  const router = useRouter();
  const { clearCart } = useCart();

  const [session, setSession] = useState<PaymentSession | null | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();

  const loadSession = useCallback(() => {
    let isMounted = true;
    getPaymentSessionById(sessionId).then((data) => {
      if (isMounted) setSession(data ?? null);
    });
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  useEffect(() => loadSession(), [loadSession]);

  async function handleConfirmPayment() {
    if (!session) return;
    setIsProcessing(true);
    setActionError(undefined);

    try {
      const { order } = await confirmPaymentSession(session.id);
      clearCart();
      router.push(`/don-hang/${order.orderCode}`);
    } catch (error) {
      console.error("Xác nhận thanh toán thất bại:", error);
      setActionError(error instanceof Error ? error.message : "Không thể xác nhận thanh toán.");
      loadSession();
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReportFailure() {
    if (!session) return;
    setIsProcessing(true);
    try {
      setSession(await reportPaymentFailure(session.id));
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRetry() {
    if (!session) return;
    setIsProcessing(true);
    try {
      setSession(await retryPaymentSession(session.id));
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCancel() {
    if (!session) {
      router.push("/gio-hang");
      return;
    }
    try {
      await cancelPaymentSession(session.id);
    } finally {
      router.push("/gio-hang");
    }
  }

  return { session, isProcessing, actionError, handleConfirmPayment, handleReportFailure, handleRetry, handleCancel };
}
