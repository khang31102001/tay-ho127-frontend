import { SEED_DELIVERY_METHODS } from "../mocks/delivery-method.mock";
import type { ManagedDeliveryMethod } from "../types/delivery-method.types";

const STORAGE_KEY = "tayho-admin-delivery-methods";
const MOCK_DELAY_MS = 300;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readStore(): ManagedDeliveryMethod[] {
  if (typeof window === "undefined") {
    return SEED_DELIVERY_METHODS;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DELIVERY_METHODS));
    return SEED_DELIVERY_METHODS;
  }
  return JSON.parse(raw) as ManagedDeliveryMethod[];
}

function writeStore(methods: ManagedDeliveryMethod[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
}

/** Chỉ 1 phương thức được isDefault — bỏ default ở các phương thức còn lại. */
function applyDefaultExclusivity(
  methods: ManagedDeliveryMethod[],
  keepDefaultId: string,
): ManagedDeliveryMethod[] {
  return methods.map((method) => (method.id === keepDefaultId ? method : { ...method, isDefault: false }));
}

export async function listDeliveryMethods(): Promise<ManagedDeliveryMethod[]> {
  await delay();
  return [...readStore()].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getDeliveryMethodById(id: string): Promise<ManagedDeliveryMethod | undefined> {
  await delay();
  return readStore().find((method) => method.id === id);
}

export async function getDeliveryMethodByCode(code: string): Promise<ManagedDeliveryMethod | undefined> {
  await delay();
  return readStore().find((method) => method.code === code);
}

/**
 * Công thức tính phí giao hàng — dùng chung bởi Checkout (preview phía
 * client) VÀ order.service.ts (giá trị tính phí thật khi tạo Order), để 2
 * nơi không lệch công thức. order.service.ts vẫn là nơi duy nhất áp dụng
 * kết quả này vào Order — Checkout chỉ dùng để hiển thị preview.
 */
export function resolveDeliveryFee(method: ManagedDeliveryMethod, subtotal: number): number {
  if (method.freeShippingThreshold !== undefined && subtotal >= method.freeShippingThreshold) {
    return 0;
  }
  return method.baseFee;
}

/**
 * Tương đương GET /delivery-methods/available — Checkout PHẢI gọi hàm này
 * để lấy danh sách động, không hard-code phương thức trong UI Checkout.
 */
export async function listAvailableDeliveryMethods(): Promise<ManagedDeliveryMethod[]> {
  await delay();
  return readStore()
    .filter((method) => method.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export type DeliveryMethodUpsertInput = Omit<ManagedDeliveryMethod, "id" | "createdAt" | "updatedAt">;

export async function createDeliveryMethod(payload: DeliveryMethodUpsertInput): Promise<ManagedDeliveryMethod> {
  await delay();
  const now = new Date().toISOString();
  const newMethod: ManagedDeliveryMethod = { ...payload, id: `dm-${Date.now()}`, createdAt: now, updatedAt: now };

  const existing = readStore();
  const next = payload.isDefault ? applyDefaultExclusivity(existing, newMethod.id) : existing;
  writeStore([...next, newMethod]);

  return newMethod;
}

export async function updateDeliveryMethod(
  id: string,
  payload: DeliveryMethodUpsertInput,
): Promise<ManagedDeliveryMethod> {
  await delay();
  const current = readStore().find((method) => method.id === id);
  const updated: ManagedDeliveryMethod = {
    ...payload,
    id,
    createdAt: current?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const replaced = readStore().map((method) => (method.id === id ? updated : method));
  writeStore(payload.isDefault ? applyDefaultExclusivity(replaced, id) : replaced);

  return updated;
}

export async function deleteDeliveryMethod(id: string): Promise<void> {
  await delay();
  writeStore(readStore().filter((method) => method.id !== id));
}
