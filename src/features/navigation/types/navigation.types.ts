export const NAVIGATION_LOCATION_OPTIONS = [
  { value: "header", label: "Header (Website)" },
  { value: "footer", label: "Footer (Website)" },
  { value: "mobile", label: "Mobile Navigation" },
  { value: "admin-sidebar", label: "Admin Sidebar" },
] as const;

export type NavigationLocation = (typeof NAVIGATION_LOCATION_OPTIONS)[number]["value"];

export const NAVIGATION_TARGET_TYPE_OPTIONS = [
  { value: "page", label: "Trang CMS (Page)" },
  { value: "route", label: "Route nội bộ" },
  { value: "external", label: "URL ngoài hệ thống" },
] as const;

export type NavigationTargetType = (typeof NAVIGATION_TARGET_TYPE_OPTIONS)[number]["value"];

/**
 * Hình dạng RESPONSE (khớp Backend contract tương lai) — items là cây đã
 * dựng sẵn (children lồng nhau), đã lọc isVisible và sắp theo sortOrder,
 * targetType="page" đã được resolve thành url thật. Đây là type Component
 * (Header/Footer/AdminSidebar) sẽ nhận được — không quan tâm gì tới cách
 * lưu trữ bên dưới.
 */
export interface NavigationItem {
  id: string;
  parentId: string | null;
  label: string;
  targetType: NavigationTargetType;
  targetId?: string | null;
  url?: string | null;
  icon?: string | null;
  sortOrder: number;
  isVisible: boolean;
  openInNewTab?: boolean;
  children?: NavigationItem[];
}

export interface NavigationMenu {
  id: string;
  code: string;
  name: string;
  location: NavigationLocation;
  isActive: boolean;
  items: NavigationItem[];
}

/**
 * Hình dạng LƯU TRỮ (mock store, admin CRUD) — phẳng theo parentId, giống hệt
 * pattern ManagedCategory/ManagedArticleCategory đã dùng trong project (tự
 * tham chiếu cha-con qua parentId, không nhúng children). `menuId` là field
 * nội bộ CẦN THÊM so với NavigationItem gốc — vì 1 menu có nhiều item, phải
 * biết item thuộc menu nào để CRUD/list theo menu (Backend thật chắc chắn
 * cũng cần cột tương đương, dù response trả về không lộ field này ra ngoài).
 */
export type ManagedNavigationItem = Omit<NavigationItem, "children"> & {
  menuId: string;
};

/** Bản ghi Menu lưu trữ — không nhúng items (items dựng động khi cần, xem navigation.service.ts). */
export type ManagedNavigationMenu = Omit<NavigationMenu, "items">;
