import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedMenu } from "../types/menu.types";

/**
 * Admin → Catalog → Thực đơn, gọi Backend /api/v1/catalog/sales-menus (quyền
 * sales-menus.*). `code` chỉ nhập khi tạo (Site tra thực đơn theo code), trùng
 * code → 409. Xóa thực đơn xóa luôn các dòng Menu-SP của nó.
 */

/** SalesMenuResponse của Backend. */
type SalesMenuDto = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

function toManagedMenu(dto: SalesMenuDto): ManagedMenu {
  return { id: dto.id, code: dto.code, name: dto.name, status: dto.isActive ? "active" : "inactive" };
}

export async function listMenus(): Promise<ManagedMenu[]> {
  const page = await adminApi.get<PaginatedResult<SalesMenuDto>>("/catalog/sales-menus", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedMenu);
}

export async function getMenuById(id: string): Promise<ManagedMenu> {
  return toManagedMenu(await adminApi.get<SalesMenuDto>(`/catalog/sales-menus/${id}`));
}

export async function createMenu(payload: Omit<ManagedMenu, "id">): Promise<ManagedMenu> {
  return toManagedMenu(
    await adminApi.post<SalesMenuDto>("/catalog/sales-menus", {
      code: payload.code.trim(),
      name: payload.name,
      isActive: payload.status === "active",
    }),
  );
}

/** Không gửi `code` — Backend không cho đổi code sau khi tạo. */
export async function updateMenu(id: string, payload: Omit<ManagedMenu, "id" | "code">): Promise<ManagedMenu> {
  return toManagedMenu(
    await adminApi.put<SalesMenuDto>(`/catalog/sales-menus/${id}`, {
      name: payload.name,
      isActive: payload.status === "active",
    }),
  );
}

export function deleteMenu(id: string): Promise<void> {
  return adminApi.delete<void>(`/catalog/sales-menus/${id}`);
}
