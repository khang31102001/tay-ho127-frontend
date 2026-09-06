import { SEED_PAYMENT_METHODS } from "../mocks/payment-method.mock";
import type { ManagedPaymentMethod } from "../types/payment-method.types";

/**
 * "-v2" vì `group` từng là nhị phân "online"/"offline" trước khi đổi sang 4
 * PaymentMethodGroup thật (cod/bank_transfer/card/e_wallet — xem
 * payment-method.types.ts). Trình duyệt đã cache dữ liệu theo shape cũ sẽ có
 * `group` không khớp bất kỳ giá trị nào PaymentMethodSelector nhận diện được
 * (resolvePaymentMethod trả về undefined), khiến toàn bộ danh sách bị lọc
 * rỗng và Checkout không hiển thị phương thức thanh toán nào — đổi tên key để
 * buộc các bản cache cũ tự reseed theo SEED_PAYMENT_METHODS mới thay vì kẹt
 * vĩnh viễn với shape lỗi thời.
 */
const STORAGE_KEY = "tayho-admin-payment-methods-v2";
const MOCK_DELAY_MS = 300;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readStore(): ManagedPaymentMethod[] {
  if (typeof window === "undefined") {
    return SEED_PAYMENT_METHODS;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PAYMENT_METHODS));
    return SEED_PAYMENT_METHODS;
  }
  return JSON.parse(raw) as ManagedPaymentMethod[];
}

function writeStore(methods: ManagedPaymentMethod[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
}

/** Chỉ 1 phương thức được isDefault — bỏ default ở các phương thức còn lại. */
function applyDefaultExclusivity(methods: ManagedPaymentMethod[], keepDefaultId: string): ManagedPaymentMethod[] {
  return methods.map((method) => (method.id === keepDefaultId ? method : { ...method, isDefault: false }));
}

export async function listPaymentMethods(): Promise<ManagedPaymentMethod[]> {
  await delay();
  return [...readStore()].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getPaymentMethodById(id: string): Promise<ManagedPaymentMethod | undefined> {
  await delay();
  return readStore().find((method) => method.id === id);
}

export async function getPaymentMethodByCode(code: string): Promise<ManagedPaymentMethod | undefined> {
  await delay();
  return readStore().find((method) => method.code === code);
}

/**
 * Kiểm tra đơn hàng có đủ điều kiện áp dụng phương thức thanh toán này
 * không (minOrderAmount/maxOrderAmount) — dùng chung bởi Checkout (hiển thị
 * gợi ý) và order.service.ts (chặn thật khi tạo Order).
 */
export function isPaymentMethodEligible(method: ManagedPaymentMethod, subtotal: number): boolean {
  if (method.minOrderAmount !== undefined && subtotal < method.minOrderAmount) {
    return false;
  }
  if (method.maxOrderAmount !== undefined && subtotal > method.maxOrderAmount) {
    return false;
  }
  return true;
}

/**
 * Tương đương GET /payment-methods/available — Checkout PHẢI gọi hàm này để
 * lấy danh sách động, không hard-code phương thức trong UI Checkout.
 */
export async function listAvailablePaymentMethods(): Promise<ManagedPaymentMethod[]> {
  await delay();
  return readStore()
    .filter((method) => method.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export type PaymentMethodUpsertInput = Omit<ManagedPaymentMethod, "id" | "createdAt" | "updatedAt">;

export async function createPaymentMethod(payload: PaymentMethodUpsertInput): Promise<ManagedPaymentMethod> {
  await delay();
  const now = new Date().toISOString();
  const newMethod: ManagedPaymentMethod = { ...payload, id: `pm-${Date.now()}`, createdAt: now, updatedAt: now };

  const existing = readStore();
  const next = payload.isDefault ? applyDefaultExclusivity(existing, newMethod.id) : existing;
  writeStore([...next, newMethod]);

  return newMethod;
}

export async function updatePaymentMethod(
  id: string,
  payload: PaymentMethodUpsertInput,
): Promise<ManagedPaymentMethod> {
  await delay();
  const current = readStore().find((method) => method.id === id);
  const updated: ManagedPaymentMethod = {
    ...payload,
    id,
    createdAt: current?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const replaced = readStore().map((method) => (method.id === id ? updated : method));
  writeStore(payload.isDefault ? applyDefaultExclusivity(replaced, id) : replaced);

  return updated;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await delay();
  writeStore(readStore().filter((method) => method.id !== id));
}
