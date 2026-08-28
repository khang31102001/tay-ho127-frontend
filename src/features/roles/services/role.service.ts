import type { ManagedRole } from "../types/role.types";
import { SEED_ROLES } from "../mocks/role.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý vai trò thật.
 * Dữ liệu seed (xem ../mocks/role.mock.ts) + đồng bộ 2 chiều với localStorage
 * để không mất khi reload trang. Khi có backend thật, chỉ cần thay nội dung
 * các hàm dưới đây.
 */
const STORAGE_KEY = "tayho-admin-roles";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedRole[] {
  if (typeof window === "undefined") {
    return SEED_ROLES;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedRole[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu vai trò admin:", error);
  }

  return SEED_ROLES;
}

function writeStore(roles: ManagedRole[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  } catch (error) {
    console.error("Không thể lưu dữ liệu vai trò admin:", error);
  }
}

export async function listRoles(): Promise<ManagedRole[]> {
  await delay();
  return readStore();
}

export async function getRoleById(id: string): Promise<ManagedRole | null> {
  await delay();
  return readStore().find((role) => role.id === id) ?? null;
}

export async function createRole(payload: Omit<ManagedRole, "id">): Promise<ManagedRole> {
  await delay();

  const newRole: ManagedRole = { ...payload, id: `role-${Date.now()}` };

  writeStore([...readStore(), newRole]);

  return newRole;
}

export async function updateRole(
  id: string,
  payload: Omit<ManagedRole, "id">,
): Promise<ManagedRole> {
  await delay();

  const updatedRole: ManagedRole = { ...payload, id };

  writeStore(readStore().map((role) => (role.id === id ? updatedRole : role)));

  return updatedRole;
}

export async function deleteRole(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((role) => role.id !== id));
}
