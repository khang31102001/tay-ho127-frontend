import type { ManagedUser } from "../types/user.types";
import { SEED_USERS } from "../mocks/user.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý người dùng thật.
 * Dữ liệu seed (xem ../mocks/user.mock.ts) + đồng bộ 2 chiều với localStorage
 * để không mất khi reload trang. Khi có backend thật, chỉ cần thay nội dung
 * các hàm dưới đây.
 */
const STORAGE_KEY = "tayho-admin-users";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedUser[] {
  if (typeof window === "undefined") {
    return SEED_USERS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedUser[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu người dùng admin:", error);
  }

  return SEED_USERS;
}

function writeStore(users: ManagedUser[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Không thể lưu dữ liệu người dùng admin:", error);
  }
}

export async function listUsers(): Promise<ManagedUser[]> {
  await delay();
  return readStore();
}

export async function getUserById(id: string): Promise<ManagedUser | null> {
  await delay();
  return readStore().find((user) => user.id === id) ?? null;
}

export async function createUser(payload: Omit<ManagedUser, "id">): Promise<ManagedUser> {
  await delay();

  const newUser: ManagedUser = { ...payload, id: `user-${Date.now()}` };

  writeStore([...readStore(), newUser]);

  return newUser;
}

export async function updateUser(
  id: string,
  payload: Omit<ManagedUser, "id">,
): Promise<ManagedUser> {
  await delay();

  const updatedUser: ManagedUser = { ...payload, id };

  writeStore(readStore().map((user) => (user.id === id ? updatedUser : user)));

  return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((user) => user.id !== id));
}
