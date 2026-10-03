"use client";

import { useCallback, useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { useCart } from "@/features/cart";
import {
  cancelPaymentSession,
  getPaymentSessionById,
  retryPaymentSession,
} from "../services/payment-session.service";
import type { PaymentSession } from "../types/payment.types";

/** Trang thanh toán hỏi lại trạng thái phiên mỗi bấy nhiêu ms trong lúc chờ nhân viên xác nhận đã nhận tiền. */
const POLL_INTERVAL_MS = 5_000;

/**
 * Payment Page (QR/DIGITAL_WALLET) — đọc PaymentSession theo id trên URL và TỰ KIỂM TRA trạng thái trong lúc chờ nhân viên xác
 * nhận đã nhận tiền (khách không có nút "tôi đã thanh toán" — chỉ nhân viên/cổng thanh toán mới đánh dấu đã thu). Khi phiên
 * thành công (đơn đã được tạo) thì xóa giỏ hàng và chuyển sang trang theo dõi đơn. `undefined` = đang tải, `null` = không
 * tìm thấy hoặc lỗi tải.
 */
export function usePaymentPage(sessionId: string) {
  const router = useNavigationRouter();
  const { clearCart } = useCart();

  const [session, setSession] = useState<PaymentSession | null | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();

  const refreshSession = useCallback(async () => {
    try {
      setSession(await getPaymentSessionById(sessionId));
    } catch (error) {
      // Mất mạng tạm thời: giữ nguyên trạng thái đang hiển thị, lần hỏi sau sẽ thử lại.
      console.error("Không thể tải phiên thanh toán:", error);
      setSession((current) => (current === undefined ? null : current));
    }
  }, [sessionId]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const status = session?.status;

  useEffect(() => {
    if (status !== "pending") return;

    const intervalId = setInterval(() => void refreshSession(), POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [status, refreshSession]);

  const orderCode = session?.status === "success" ? session.orderCode : null;

  useEffect(() => {
    if (!orderCode) return;

    clearCart();
    router.push(`/don-hang/${orderCode}`);
    // Chỉ chạy một lần khi phiên vừa thành công.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode]);

  async function handleRetry() {
    if (!session) return;
    setIsProcessing(true);
    setActionError(undefined);
    try {
      setSession(await retryPaymentSession(session.id));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể thử lại phiên thanh toán.");
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
    } catch (error) {
      // Hủy không được (đã thành công/mất mạng) thì vẫn cho khách quay lại giỏ hàng; phiên sẽ tự hết hạn.
      console.error("Không thể hủy phiên thanh toán:", error);
    } finally {
      router.push("/gio-hang");
    }
  }

  return { session, isProcessing, actionError, handleRetry, handleCancel };
}
