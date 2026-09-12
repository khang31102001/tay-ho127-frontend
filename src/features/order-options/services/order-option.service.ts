import { SEED_ORDER_OPTIONS } from "../mocks/order-option.mock";
import type { ManagedOrderOptionGroup } from "../types/order-option.types";

/**
 * Cùng pattern localStorage-backed mock với các domain khác (xem CLAUDE.md —
 * mocks/<name>.mock.ts + services/<name>.service.ts). Admin Explorer/Editor
 * (features/order-options/components) quản lý CRUD tại đây — Cart/Checkout
 * chỉ gọi listGeneralOrderOptions(), không cần đổi khi Admin thêm/sửa/xóa.
 */
const STORAGE_KEY = "tayho-admin-order-options";
const MOCK_DELAY_MS = 150;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function writeStore(groups: ManagedOrderOptionGroup[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error("Không thể lưu dữ liệu General Order Options:", error);
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

/** Dùng bởi order.service.ts khi tạo Order — tra cứu lại label/giá thật theo groupId, không tin dữ liệu Frontend gửi lên (giống getModifierGroupById). */
export async function getOrderOptionGroupById(id: string): Promise<ManagedOrderOptionGroup | null> {
  await delay();
  return readStore().find((group) => group.id === id) ?? null;
}

export type OrderOptionGroupUpsertInput = Omit<ManagedOrderOptionGroup, "id" | "createdAt" | "updatedAt">;

export async function createOrderOptionGroup(payload: OrderOptionGroupUpsertInput): Promise<ManagedOrderOptionGroup> {
  await delay();
  const now = new Date().toISOString();
  const newGroup: ManagedOrderOptionGroup = { ...payload, id: `order-opt-${Date.now()}`, createdAt: now, updatedAt: now };

  writeStore([...readStore(), newGroup]);

  return newGroup;
}

export async function updateOrderOptionGroup(
  id: string,
  payload: OrderOptionGroupUpsertInput,
): Promise<ManagedOrderOptionGroup> {
  await delay();
  const current = readStore().find((group) => group.id === id);
  const updated: ManagedOrderOptionGroup = {
    ...payload,
    id,
    createdAt: current?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeStore(readStore().map((group) => (group.id === id ? updated : group)));

  return updated;
}

export async function deleteOrderOptionGroup(id: string): Promise<void> {
  await delay();
  writeStore(readStore().filter((group) => group.id !== id));
}
