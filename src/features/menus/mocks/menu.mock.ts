import type { ManagedMenu } from "../types/menu.types";

/**
 * "Thực đơn chính", "Món yêu thích" và "Gợi ý thêm món" là 3 Menu thật đang
 * chi phối Customer Site (xem features/menu/services/menu.service.ts): trang
 * /thuc-don đọc MenuProduct của menu-thuc-don-chinh, trang chủ (FavoriteSection)
 * đọc menu-mon-yeu-thich, section "Có thể bạn muốn dùng thêm" ở Cart Page
 * (/gio-hang) đọc menu-goi-y-them. 2 menu còn lại chỉ là dữ liệu demo cho
 * Admin CRUD, chưa gắn với site.
 */
export const SEED_MENUS: ManagedMenu[] = [
  { id: "menu-thuc-don-chinh", name: "Thực đơn chính", status: "active" },
  { id: "menu-mon-yeu-thich", name: "Món yêu thích", status: "active" },
  { id: "menu-goi-y-them", name: "Gợi ý thêm món (Cross-sell)", status: "active" },
  { id: "menu-cuoi-tuan", name: "Thực đơn cuối tuần", status: "active" },
  { id: "menu-le-tet", name: "Thực đơn lễ Tết", status: "inactive" },
];
