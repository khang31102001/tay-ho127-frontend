"use client";

import { useCallback, useEffect, useState } from "react";

// Import thẳng type (không qua barrel @/features/payment) — barrel đó re-export UI Site, lý do đầy đủ xem
// features/menu/services/menu.service.ts.
import type { PaymentSession } from "@/features/payment/types/payment.types";

import {
  confirmPaymentSession,
  listPaymentSessions,
  rejectPaymentSession,
} from "../services/payment-session-admin.service";

/** Danh sách phiên chờ tự làm mới mỗi bấy nhiêu ms để nhân viên thấy phiên mới của khách mà không cần tải lại trang. */
const REFRESH_INTERVAL_MS = 15_000;

export type PaymentSessionsPanelNotice = { tone: "success" | "error"; message: string };

/** Phiên thanh toán QR/ví đang chờ nhân viên xác nhận đã nhận tiền — xác nhận (tạo đơn) hoặc từ chối. */
export function usePaymentSessionsPanel() {
  const [sessions, setSessions] = useState<PaymentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<PaymentSessionsPanelNotice | null>(null);

  const load = useCallback(async () => {
    try {
      setSessions(await listPaymentSessions("pending"));
    } catch (error) {
      console.error("Không thể tải phiên thanh toán:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const intervalId = setInterval(() => void load(), REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [load]);

  async function handleConfirm(session: PaymentSession) {
    setBusySessionId(session.id);
    setNotice(null);
    try {
      const confirmed = await confirmPaymentSession(session.id);
      setNotice({ tone: "success", message: `Đã xác nhận thanh toán — đơn ${confirmed.orderCode} đã được tạo.` });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Không thể xác nhận thanh toán." });
    } finally {
      setBusySessionId(null);
      await load();
    }
  }

  async function handleReject(session: PaymentSession, note: string) {
    setBusySessionId(session.id);
    setNotice(null);
    try {
      await rejectPaymentSession(session.id, note.trim() || undefined);
      setNotice({ tone: "success", message: `Đã từ chối phiên ${session.referenceCode}.` });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Không thể từ chối phiên thanh toán." });
    } finally {
      setBusySessionId(null);
      await load();
    }
  }

  return { sessions, isLoading, busySessionId, notice, handleConfirm, handleReject };
}
