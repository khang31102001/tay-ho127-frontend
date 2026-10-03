"use client";

import { useCallback, useEffect, useState } from "react";

// Import thẳng (không qua barrel @/features/auth) — barrel đó re-export AuthModal (UI), lý do đầy đủ xem
// features/menu/services/menu.service.ts.
import { useAuth } from "@/features/auth/context/auth-context";
import { getCustomerOrder, lookupOrder, retryOrderPayment } from "../services/site-order.service";
import type { ManagedOrder } from "../types/order.types";
import { recallOrderPhone } from "../utils/order-phone-memory";

export type OrderTrackingStatus = "loading" | "ready" | "ask-phone" | "error";

/**
 * Trang theo dõi đơn (/don-hang/{mã}) — chỉ người chứng minh được đơn là của mình mới xem được:
 * 1. Khách đang đăng nhập và đơn thuộc tài khoản họ → xem thẳng.
 * 2. Trình duyệt này vừa đặt đơn (nhớ được SĐT) → tra bằng mã + SĐT đã nhớ.
 * 3. Ngược lại hỏi SĐT đặt hàng ("ask-phone"); Backend trả 404 như nhau cho mã sai và SĐT sai nên không dò mã được.
 */
export function useOrderTracking(orderCode: string) {
  const { user, isAuthLoaded } = useAuth();

  const [order, setOrder] = useState<ManagedOrder | null>(null);
  const [status, setStatus] = useState<OrderTrackingStatus>("loading");
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoaded) return;

    let isMounted = true;

    async function load() {
      try {
        const ownOrder = user ? await getCustomerOrder(orderCode) : null;
        const rememberedPhone = recallOrderPhone(orderCode);
        const found = ownOrder ?? (rememberedPhone ? await lookupOrder(orderCode, rememberedPhone) : null);

        if (!isMounted) return;
        if (found) {
          setOrder(found);
          setStatus("ready");
        } else {
          setStatus("ask-phone");
        }
      } catch (error) {
        console.error("Không thể tải đơn hàng:", error);
        if (isMounted) setStatus("error");
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [orderCode, isAuthLoaded, user]);

  const submitPhone = useCallback(
    async (phone: string) => {
      setIsVerifyingPhone(true);
      setPhoneError(null);

      try {
        const found = await lookupOrder(orderCode, phone);
        if (found) {
          setOrder(found);
          setStatus("ready");
        } else {
          setPhoneError("Số điện thoại không khớp với đơn hàng này.");
        }
      } catch (error) {
        setPhoneError(error instanceof Error ? error.message : "Không thể kiểm tra đơn hàng.");
      } finally {
        setIsVerifyingPhone(false);
      }
    },
    [orderCode],
  );

  /** Khách bấm "Thanh toán lại" khi thanh toán thất bại — đưa giao dịch về "chờ thanh toán". */
  const handleRetryPayment = useCallback(async () => {
    if (!order) return;

    setIsRetrying(true);
    setRetryError(null);
    try {
      setOrder(await retryOrderPayment(order.orderCode, order.phone));
    } catch (error) {
      console.error("Không thể thanh toán lại:", error);
      setRetryError(error instanceof Error ? error.message : "Không thể thanh toán lại.");
    } finally {
      setIsRetrying(false);
    }
  }, [order]);

  return { order, status, submitPhone, isVerifyingPhone, phoneError, handleRetryPayment, isRetrying, retryError };
}
