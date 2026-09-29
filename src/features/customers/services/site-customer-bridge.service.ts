import type { ManagedCustomer } from "../types/customer.types";
import { SEED_CUSTOMERS } from "../mocks/customer.mock";

/**
 * MOCK CONTRACT — cầu nối Auth↔Customer của SITE (features/auth). Đăng nhập /
 * đăng ký khách hàng trên Site vẫn là mock (app/api/auth/*), nên khách hàng
 * gắn với phiên Site cũng vẫn nằm trong store localStorage này (đơn hàng mock
 * và Lịch sử đơn tra theo id ở đây). Màn Admin → Khách hàng KHÔNG đọc store
 * này — nó gọi Backend (services/customer.service.ts).
 *
 * Tách riêng khỏi customer.service.ts để khi chuyển đăng nhập Site sang
 * Backend (/api/v1/customer/auth/*) chỉ cần xóa file này + mock seed.
 * Giữ nguyên STORAGE_KEY để không mất dữ liệu đang có trong trình duyệt.
 */
const STORAGE_KEY = "tayho-admin-customers";
const MOCK_DELAY_MS = 300;

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
    console.error("Không thể đọc dữ liệu khách hàng của Site:", error);
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
    console.error("Không thể lưu dữ liệu khách hàng của Site:", error);
  }
}

/** Sinh mã KH00001, KH00002... dựa trên số lớn nhất đang có. */
function generateCustomerCode(existing: ManagedCustomer[]): string {
  const maxNumber = existing.reduce((max, customer) => {
    const match = customer.customerCode.match(/(\d+)$/);
    return Math.max(max, match ? parseInt(match[1], 10) : 0);
  }, 0);

  return `KH${String(maxNumber + 1).padStart(5, "0")}`;
}

export type FindOrCreateCustomerInput = {
  fullName: string;
  phone?: string;
  email?: string;
};

/**
 * Gọi CLIENT-SIDE sau khi Site đăng nhập/đăng ký thành công — store đọc/ghi
 * localStorage nên phải chạy trong trình duyệt. Tra theo phone hoặc email đã
 * có (khớp 1 trong 2 là đủ); chưa có thì tạo khách hàng mới.
 */
export async function findOrCreateCustomerByContact(input: FindOrCreateCustomerInput): Promise<ManagedCustomer> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  const existing = readStore();

  const match = existing.find(
    (customer) => (input.phone && customer.phone === input.phone) || (input.email && customer.email === input.email),
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
