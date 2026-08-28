import type { ManagedMenu } from "../types/menu.types";

/**
 * "Thực đơn chính" và "Món yêu thích" là 2 Menu thật đang chi phối Customer
 * Site (xem features/menu/services/menu.service.ts): trang /thuc-don đọc
 * MenuProduct của menu-thuc-don-chinh, trang chủ (FavoriteSection) đọc
 * MenuProduct của menu-mon-yeu-thich. 2 menu còn lại chỉ là dữ liệu demo cho
 * Admin CRUD, chưa gắn với site.
 */
export const SEED_MENUS: ManagedMenu[] = [
  { id: "menu-thuc-don-chinh", name: "Thực đơn chính", status: "active" },
  { id: "menu-mon-yeu-thich", name: "Món yêu thích", status: "active" },
  { id: "menu-cuoi-tuan", name: "Thực đơn cuối tuần", status: "active" },
  { id: "menu-le-tet", name: "Thực đơn lễ Tết", status: "inactive" },
];
