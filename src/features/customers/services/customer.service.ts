import type { ManagedCustomer } from "../types/customer.types";
import { SEED_CUSTOMERS } from "../mocks/customer.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý khách hàng thật. Dữ liệu seed (xem
 * ../mocks/customer.mock.ts) + đồng bộ 2 chiều với localStorage.
 */
const STORAGE_KEY = "tayho-admin-customers";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedCustomer[] {
  if (typeof window === "undefined") {
    return SEED_CUSTOMERS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedCustomer[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu khách hàng admin:", error);
  }

  return SEED_CUSTOMERS;
}

function writeStore(customers: ManagedCustomer[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch (error) {
    console.error("Không thể lưu dữ liệu khách hàng admin:", error);
  }
}

/** Sinh mã KH00001, KH00002... dựa trên số lớn nhất đang có, không phụ thuộc thứ tự xóa. */
function generateCustomerCode(existing: ManagedCustomer[]): string {
  const maxNumber = existing.reduce((max, customer) => {
    const match = customer.customerCode.match(/(\d+)$/);
    const value = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, value);
  }, 0);

  return `KH${String(maxNumber + 1).padStart(5, "0")}`;
}

export async function listCustomers(): Promise<ManagedCustomer[]> {
  await delay();
  return readStore();
}

export async function getCustomerById(id: string): Promise<ManagedCustomer | null> {
  await delay();
  return readStore().find((customer) => customer.id === id) ?? null;
}

export type CustomerUpsertInput = Omit<
  ManagedCustomer,
  "id" | "customerCode" | "createdAt" | "updatedAt"
>;

export async function createCustomer(payload: CustomerUpsertInput): Promise<ManagedCustomer> {
  await delay();

  const existing = readStore();
  const now = new Date().toISOString();

  const newCustomer: ManagedCustomer = {
    ...payload,
    id: `customer-${Date.now()}`,
    customerCode: generateCustomerCode(existing),
    createdAt: now,
    updatedAt: now,
  };

  writeStore([...existing, newCustomer]);

  return newCustomer;
}

export async function updateCustomer(
  id: string,
  payload: CustomerUpsertInput,
): Promise<ManagedCustomer> {
  await delay();

  const current = readStore().find((customer) => customer.id === id);
  const now = new Date().toISOString();

  const updatedCustomer: ManagedCustomer = {
    id,
    customerCode: current?.customerCode ?? generateCustomerCode(readStore()),
    ...payload,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };

  writeStore(readStore().map((customer) => (customer.id === id ? updatedCustomer : customer)));

  return updatedCustomer;
}

export async function deleteCustomer(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((customer) => customer.id !== id));
}

export type FindOrCreateCustomerInput = {
  fullName: string;
  phone?: string;
  email?: string;
};

/**
 * Bridge Auth↔Customer (Phase 6) — gọi CLIENT-SIDE sau khi Site đăng nhập/đăng
 * ký thành công (features/auth), KHÔNG gọi trong Route Handler server-side vì
 * store này đọc/ghi localStorage (server không có window, xem readStore/writeStore
 * ở trên) — phải chạy trong trình duyệt mới đọc/ghi đúng.
 *
 * Tra theo phone hoặc email đã có (khớp 1 trong 2 là đủ, vì luồng đăng nhập
 * hiện tại chỉ có email, luồng đăng ký chỉ có phone — 2 field không luôn cùng
 * tồn tại). Chưa có thì tạo ManagedCustomer mới.
 */
export async function findOrCreateCustomerByContact(input: FindOrCreateCustomerInput): Promise<ManagedCustomer> {
  await delay();
  const existing = readStore();

  const match = existing.find(
    (customer) =>
      (input.phone && customer.phone === input.phone) || (input.email && customer.email === input.email),
  );

  if (match) {
    return match;
  }

  const now = new Date().toISOString();
  const newCustomer: ManagedCustomer = {
    id: `customer-${Date.now()}`,
    customerCode: generateCustomerCode(existing),
    fullName: input.fullName,
    phone: input.phone ?? "",
    email: input.email,
    avatarMediaId: null,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  writeStore([...existing, newCustomer]);

  return newCustomer;
}
