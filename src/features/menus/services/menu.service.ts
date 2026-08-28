import type { ManagedMenu } from "../types/menu.types";
import { SEED_MENUS } from "../mocks/menu.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý thực đơn (Catalog) thật. Dữ liệu
 * seed (xem ../mocks/menu.mock.ts) + đồng bộ 2 chiều với localStorage.
 */
const STORAGE_KEY = "tayho-admin-catalog-menus";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedMenu[] {
  if (typeof window === "undefined") {
    return SEED_MENUS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedMenu[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu thực đơn catalog:", error);
  }

  return SEED_MENUS;
}

function writeStore(menus: ManagedMenu[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
  } catch (error) {
    console.error("Không thể lưu dữ liệu thực đơn catalog:", error);
  }
}

export async function listMenus(): Promise<ManagedMenu[]> {
  await delay();
  return readStore();
}

export async function getMenuById(id: string): Promise<ManagedMenu | null> {
  await delay();
  return readStore().find((menu) => menu.id === id) ?? null;
}

export async function createMenu(payload: Omit<ManagedMenu, "id">): Promise<ManagedMenu> {
  await delay();

  const newMenu: ManagedMenu = { ...payload, id: `menu-${Date.now()}` };

  writeStore([...readStore(), newMenu]);

  return newMenu;
}

export async function updateMenu(
  id: string,
  payload: Omit<ManagedMenu, "id">,
): Promise<ManagedMenu> {
  await delay();

  const updatedMenu: ManagedMenu = { ...payload, id };

  writeStore(readStore().map((menu) => (menu.id === id ? updatedMenu : menu)));

  return updatedMenu;
}

export async function deleteMenu(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((menu) => menu.id !== id));
}
