import { updateOrderPaymentStatus, type PaymentStatus } from "@/features/orders";

import { SEED_PAYMENTS } from "../mocks/payment.mock";
import { PAYMENT_TRANSITIONS } from "../types/payment-transitions";
import type { ManagedPayment } from "../types/payment.types";
import type { PaymentTransactionAction, PaymentTransactionResult } from "../types/payment-transaction.types";
import { appendTransaction } from "./payment-transaction.service";

const STORAGE_KEY = "tayho-admin-payments";
const MOCK_DELAY_MS = 300;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readStore(): ManagedPayment[] {
  if (typeof window === "undefined") {
    return SEED_PAYMENTS;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PAYMENTS));
    return SEED_PAYMENTS;
  }
  return JSON.parse(raw) as ManagedPayment[];
}

function writeStore(payments: ManagedPayment[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
}

export async function listPayments(): Promise<ManagedPayment[]> {
  await delay();
  return [...readStore()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPaymentById(id: string): Promise<ManagedPayment | undefined> {
  await delay();
  return readStore().find((payment) => payment.id === id);
}

const TRANSITION_ACTION: Record<PaymentStatus, PaymentTransactionAction> = {
  pending: "retry",
  paid: "charge",
  failed: "charge",
  refunded: "refund",
  cancelled: "cancel",
};

const TRANSITION_RESULT: Record<PaymentStatus, PaymentTransactionResult> = {
  pending: "success",
  paid: "success",
  failed: "failed",
  refunded: "success",
  cancelled: "success",
};

/**
 * Chỉ cho phép chuyển trạng thái hợp lệ theo PAYMENT_TRANSITIONS (chặn ở
 * service layer). Mỗi lần chuyển đều ghi 1 PaymentTransaction audit log mới
 * (không sửa entry cũ) và đồng bộ Order.paymentStatus qua features/orders
 * để list/badge của Order vẫn hiển thị đúng mà không cần Order tự biết gì
 * về domain Payment.
 */
export async function transitionPayment(
  paymentId: string,
  toStatus: PaymentStatus,
  changedBy: string,
  note?: string,
): Promise<ManagedPayment> {
  await delay();
  const existing = readStore();
  const payment = existing.find((item) => item.id === paymentId);
  if (!payment) {
    throw new Error(`Không tìm thấy giao dịch thanh toán: ${paymentId}`);
  }

  const allowedNextStatuses = PAYMENT_TRANSITIONS[payment.status];
  if (!allowedNextStatuses.includes(toStatus)) {
    throw new Error(`Không thể chuyển thanh toán từ "${payment.status}" sang "${toStatus}"`);
  }

  const now = new Date().toISOString();
  const updated: ManagedPayment = {
    ...payment,
    status: toStatus,
    updatedAt: now,
    paidAt: toStatus === "paid" ? now : payment.paidAt,
    failedAt: toStatus === "failed" ? now : payment.failedAt,
  };

  writeStore(existing.map((item) => (item.id === paymentId ? updated : item)));

  await appendTransaction({
    paymentId,
    action: TRANSITION_ACTION[toStatus],
    result: TRANSITION_RESULT[toStatus],
    changedBy,
    message: note,
  });

  await updateOrderPaymentStatus(payment.orderId, toStatus);

  return updated;
}
