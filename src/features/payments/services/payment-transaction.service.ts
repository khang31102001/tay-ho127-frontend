import { SEED_PAYMENT_TRANSACTIONS } from "../mocks/payment-transaction.mock";
import type {
  ManagedPaymentTransaction,
  PaymentTransactionAction,
  PaymentTransactionResult,
} from "../types/payment-transaction.types";

const STORAGE_KEY = "tayho-admin-payment-transactions";
const MOCK_DELAY_MS = 300;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readStore(): ManagedPaymentTransaction[] {
  if (typeof window === "undefined") {
    return SEED_PAYMENT_TRANSACTIONS;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PAYMENT_TRANSACTIONS));
    return SEED_PAYMENT_TRANSACTIONS;
  }
  return JSON.parse(raw) as ManagedPaymentTransaction[];
}

function writeStore(transactions: ManagedPaymentTransaction[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export async function listTransactionsByPaymentId(paymentId: string): Promise<ManagedPaymentTransaction[]> {
  await delay();
  return readStore()
    .filter((transaction) => transaction.paymentId === paymentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export type AppendTransactionInput = {
  paymentId: string;
  action: PaymentTransactionAction;
  result: PaymentTransactionResult;
  changedBy: string;
  gateway?: string;
  gatewayReference?: string;
  message?: string;
};

/**
 * Append-only — không có hàm update/delete cho PaymentTransaction, vì đây
 * là audit log gọi gateway, mỗi lần đổi trạng thái phải tạo entry mới thay
 * vì sửa entry cũ.
 */
export async function appendTransaction(input: AppendTransactionInput): Promise<ManagedPaymentTransaction> {
  const existing = readStore();
  const transaction: ManagedPaymentTransaction = {
    id: `ptx-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
  writeStore([...existing, transaction]);
  return transaction;
}
