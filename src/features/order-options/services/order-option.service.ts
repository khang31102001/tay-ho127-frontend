import { SEED_ORDER_OPTIONS } from "../mocks/order-option.mock";
import type { ManagedOrderOptionGroup } from "../types/order-option.types";

/**
 * Cùng pattern localStorage-backed mock với các domain khác (xem CLAUDE.md —
 * mocks/<name>.mock.ts + services/<name>.service.ts) để sau này có Admin
 * Explorer/Editor cho Order Options thì chỉ cần thêm create/update/delete tại
 * đây — Cart/Checkout gọi listGeneralOrderOptions() không cần đổi.
 */
const STORAGE_KEY = "tayho-admin-order-options";
const MOCK_DELAY_MS = 150;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readStore(): ManagedOrderOptionGroup[] {
  if (typeof window === "undefined") {
    return SEED_ORDER_OPTIONS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_ORDER_OPTIONS;

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ManagedOrderOptionGroup[]) : SEED_ORDER_OPTIONS;
  } catch (error) {
    console.error("Không thể đọc dữ liệu General Order Options:", error);
    return SEED_ORDER_OPTIONS;
  }
}

/**
 * Tương đương GET /order-options — Cart/Checkout PHẢI gọi hàm này để lấy
 * danh sách General Order Options, không hard-code Nước mắm/Rau trong UI.
 */
export async function listGeneralOrderOptions(): Promise<ManagedOrderOptionGroup[]> {
  await delay();
  return readStore();
}
