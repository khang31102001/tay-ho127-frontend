import { createMockStore } from "@/mocks/create-mock-store";
// Đi thẳng vào service của features/pages (không qua barrel) — barrel đó
// re-export cả PagesExplorer/PageEditor (UI admin), lý do xem
// app/(site)/bai-viet/page.tsx. Navigation CHỈ đọc slug để resolve URL —
// không copy title/content/SEO của Page sang Navigation (xem types.ts).
import { getPageById } from "@/features/pages/services/page.service";

import { SEED_NAVIGATION_ITEMS, SEED_NAVIGATION_MENUS } from "../mocks/navigation.mock";
import type {
  ManagedNavigationItem,
  ManagedNavigationMenu,
  NavigationItem,
  NavigationLocation,
  NavigationMenu,
} from "../types/navigation.types";
import { buildNavigationTree, filterVisibleTree, sortNavigationTree } from "../utils/navigation-tree";

/**
 * MOCK CONTRACT — mô phỏng response Backend ASP.NET Core (xem
 * ../mocks/navigation.mock.ts cho response mẫu). Đồng bộ 2 chiều với
 * localStorage, delay 350ms mô phỏng network — khớp khoảng 200-500ms yêu cầu.
 */
const menuStore = createMockStore<ManagedNavigationMenu>({
  storageKey: "tayho-admin-navigation-menus",
  seed: SEED_NAVIGATION_MENUS,
  delayMs: 350,
});

const itemStore = createMockStore<ManagedNavigationItem>({
  storageKey: "tayho-admin-navigation-items",
  seed: SEED_NAVIGATION_ITEMS,
  delayMs: 350,
});

/** targetType="page" thì resolve url thật từ CMS Page (chỉ lấy slug, không copy nội dung page). */
async function resolveItemUrl(item: ManagedNavigationItem): Promise<string | null> {
  if (item.targetType === "page" && item.targetId) {
    const page = await getPageById(item.targetId);
    return page?.slug ?? item.url ?? null;
  }
  return item.url ?? null;
}

async function resolveFlatItems(items: ManagedNavigationItem[]): Promise<ManagedNavigationItem[]> {
  return Promise.all(
    items.map(async (item) => ({ ...item, url: await resolveItemUrl(item) })),
  );
}

/** Dựng cây hoàn chỉnh (resolve URL + build tree + lọc visible + sort) cho 1 menu. */
async function assembleMenu(menu: ManagedNavigationMenu): Promise<NavigationMenu> {
  const flatItems = itemStore.read().filter((item) => item.menuId === menu.id);
  const resolvedItems = await resolveFlatItems(flatItems);
  const tree = sortNavigationTree(filterVisibleTree(buildNavigationTree(resolvedItems)));

  return { ...menu, items: tree };
}

// ============================================================
// PUBLIC — Site (render theo vị trí/code)
// ============================================================

/** Site renderer (Header/Footer/AdminSidebar) chỉ nên gọi 2 hàm này — đã lọc isActive/isVisible/sort/resolve. */
export async function getAssembledMenuByLocation(location: NavigationLocation): Promise<NavigationMenu | null> {
  await menuStore.delay();
  const menu = menuStore.read().find((item) => item.location === location && item.isActive);
  return menu ? assembleMenu(menu) : null;
}

export async function getAssembledMenuByCode(code: string): Promise<NavigationMenu | null> {
  await menuStore.delay();
  const menu = menuStore.read().find((item) => item.code === code);
  return menu ? assembleMenu(menu) : null;
}

// ============================================================
// ADMIN — Menu CRUD
// ============================================================

export async function listMenus(): Promise<ManagedNavigationMenu[]> {
  await menuStore.delay();
  return menuStore.read();
}

export async function getMenuById(id: string): Promise<ManagedNavigationMenu | undefined> {
  await menuStore.delay();
  return menuStore.read().find((menu) => menu.id === id);
}

export type NavigationMenuUpsertInput = Omit<ManagedNavigationMenu, "id">;

export async function createMenu(payload: NavigationMenuUpsertInput): Promise<ManagedNavigationMenu> {
  await menuStore.delay();
  const menu: ManagedNavigationMenu = { ...payload, id: `nav-menu-${Date.now()}` };
  menuStore.write([...menuStore.read(), menu]);
  return menu;
}

export async function updateMenu(id: string, payload: NavigationMenuUpsertInput): Promise<ManagedNavigationMenu> {
  await menuStore.delay();
  const updated: ManagedNavigationMenu = { ...payload, id };
  menuStore.write(menuStore.read().map((menu) => (menu.id === id ? updated : menu)));
  return updated;
}

/** Xóa menu kèm toàn bộ item thuộc menu đó (tránh item mồ côi). */
export async function deleteMenu(id: string): Promise<void> {
  await menuStore.delay();
  menuStore.write(menuStore.read().filter((menu) => menu.id !== id));
  itemStore.write(itemStore.read().filter((item) => item.menuId !== id));
}

// ============================================================
// ADMIN — Item CRUD
// ============================================================

export async function listItemsByMenuId(menuId: string): Promise<ManagedNavigationItem[]> {
  await itemStore.delay();
  return itemStore
    .read()
    .filter((item) => item.menuId === menuId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getItemById(itemId: string): Promise<ManagedNavigationItem | undefined> {
  await itemStore.delay();
  return itemStore.read().find((item) => item.id === itemId);
}

export type NavigationItemUpsertInput = Omit<ManagedNavigationItem, "id">;

// Khi Admin nhập sortOrder trùng với một item cùng cha đã tồn tại, "nhường
// chỗ" bằng cách đẩy các item có sortOrder >= giá trị mới lên +1 — để nhập
// sortOrder = 3 có nghĩa là "chèn vào vị trí 3", không phải "gắn nhãn 3 và
// xếp sau các item cùng nhãn theo thứ tự chèn" (stable sort).
function makeRoomForSortOrder(
  items: ManagedNavigationItem[],
  menuId: string,
  parentId: string | null,
  sortOrder: number,
  excludeId?: string,
): ManagedNavigationItem[] {
  return items.map((item) => {
    if (item.id === excludeId) return item;
    if (item.menuId === menuId && item.parentId === parentId && item.sortOrder >= sortOrder) {
      return { ...item, sortOrder: item.sortOrder + 1 };
    }
    return item;
  });
}

export async function createItem(payload: NavigationItemUpsertInput): Promise<ManagedNavigationItem> {
  await itemStore.delay();
  const existing = itemStore.read();
  const shifted = makeRoomForSortOrder(existing, payload.menuId, payload.parentId, payload.sortOrder);
  const item: ManagedNavigationItem = { ...payload, id: `nav-item-${Date.now()}` };
  itemStore.write([...shifted, item]);
  return item;
}

export async function updateItem(itemId: string, payload: NavigationItemUpsertInput): Promise<ManagedNavigationItem> {
  await itemStore.delay();
  const existing = itemStore.read();
  const shifted = makeRoomForSortOrder(existing, payload.menuId, payload.parentId, payload.sortOrder, itemId);
  const updated: ManagedNavigationItem = { ...payload, id: itemId };
  itemStore.write(shifted.map((item) => (item.id === itemId ? updated : item)));
  return updated;
}

export async function toggleItemVisibility(itemId: string): Promise<ManagedNavigationItem> {
  await itemStore.delay();
  const all = itemStore.read();
  const current = all.find((item) => item.id === itemId);
  if (!current) {
    throw new Error(`Không tìm thấy mục navigation: ${itemId}`);
  }

  const updated: ManagedNavigationItem = { ...current, isVisible: !current.isVisible };
  itemStore.write(all.map((item) => (item.id === itemId ? updated : item)));
  return updated;
}

export type ReorderNavigationItemsInput = {
  /** Cha mới của toàn bộ item trong orderedItemIds — null = mục gốc. */
  parentId: string | null;
  /** Id các item, ĐÚNG theo thứ tự mong muốn — service tự gán lại sortOrder 1..N. */
  orderedItemIds: string[];
};

/**
 * Sắp xếp lại / đổi cha 1 nhóm anh em cùng lúc — nhận danh sách id đã đúng
 * thứ tự (giống hợp đồng 1 endpoint reorder thật của backend hay có), tự
 * gán lại sortOrder tuần tự. Dùng chung cho cả 2 kiểu thao tác UI: đổi thứ
 * tự trong cùng 1 cha (Move Up/Down) và kéo-thả sang cha khác (đổi
 * `parentId` của item được kéo trước khi gọi hàm này).
 */
export async function reorderItems({ parentId, orderedItemIds }: ReorderNavigationItemsInput): Promise<void> {
  await itemStore.delay();
  const all = itemStore.read();
  const orderIndexById = new Map(orderedItemIds.map((id, index) => [id, index]));

  const updated = all.map((item) => {
    const index = orderIndexById.get(item.id);
    if (index === undefined) return item;
    return { ...item, parentId, sortOrder: index + 1 };
  });

  itemStore.write(updated);
}

/** Xóa item kèm toàn bộ item con cháu (tránh nhánh con mồ côi trỏ tới parentId không còn tồn tại). */
export async function deleteItem(itemId: string): Promise<void> {
  await itemStore.delay();
  const all = itemStore.read();

  const idsToDelete = new Set<string>([itemId]);
  let previousSize = 0;
  while (idsToDelete.size !== previousSize) {
    previousSize = idsToDelete.size;
    all.forEach((item) => {
      if (item.parentId && idsToDelete.has(item.parentId)) {
        idsToDelete.add(item.id);
      }
    });
  }

  itemStore.write(all.filter((item) => !idsToDelete.has(item.id)));
}
