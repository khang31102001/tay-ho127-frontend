/**
 * Navigation dùng MỘT mô hình cho cả Admin sidebar và menu Website (Backend module Navigation):
 * - Container (`ManagedNavigationMenu`): "admin-sidebar" (scope admin) hoặc header/footer/mobile của Site (scope site).
 * - Item (`ManagedNavigationItem`): cây cha-con tối đa 3 cấp; phần chỉ Website cần (loại đích, Page, tab mới) nằm trong `site`.
 * Menu Admin lọc theo quyền (item gắn mã quyền lá); menu Website công khai.
 */

export type NavigationScope = "admin" | "site";

/** Vị trí của menu Website (Site render theo vị trí này). */
export const NAVIGATION_LOCATION_OPTIONS = [
  { value: "header", label: "Header (Website)" },
  { value: "footer", label: "Footer (Website)" },
  { value: "mobile", label: "Mobile Navigation" },
] as const;

export type NavigationLocation = (typeof NAVIGATION_LOCATION_OPTIONS)[number]["value"];

/** Mọi vị trí Backend biết, kể cả sidebar của Admin. */
export type NavigationMenuLocation = NavigationLocation | "sidebar";

export const NAVIGATION_TARGET_TYPE_OPTIONS = [
  { value: "page", label: "Trang CMS (Page)" },
  { value: "route", label: "Route nội bộ" },
  { value: "external", label: "URL ngoài hệ thống" },
] as const;

export type NavigationTargetType = (typeof NAVIGATION_TARGET_TYPE_OPTIONS)[number]["value"];

/** NavigationMenuResponse của Backend — container cố định (seed), chỉ sửa được tên và bật/tắt. */
export type ManagedNavigationMenu = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  scope: NavigationScope;
  location: NavigationMenuLocation;
};

/** Phần chỉ Website cần — chỉ có ở item dạng liên kết của menu Website. */
export type NavigationSiteDetail = {
  targetType: NavigationTargetType;
  /** Id Page CMS khi `targetType` = "page". */
  targetId: string | null;
  openInNewTab: boolean;
};

/** NavigationItemResponse của Backend — danh sách phẳng theo `parentId`. */
export type ManagedNavigationItem = {
  id: string;
  menuId: string;
  parentId: string | null;
  code: string;
  label: string;
  isActive: boolean;
  /** Tiêu đề nhóm: không có liên kết, chỉ chứa mục con. */
  isGroup: boolean;
  url: string | null;
  icon: string | null;
  sortOrder: number;
  site: NavigationSiteDetail | null;
};

/** Nút trong cây hiển thị cho Admin (đã dựng từ danh sách phẳng). */
export type NavigationTreeItem = ManagedNavigationItem & { children: NavigationTreeItem[] };

export type CreateNavigationItemInput = {
  menuId: string;
  /** Để trống = Backend tự sinh; bất biến sau khi tạo. */
  code: string | null;
  label: string;
  parentId: string | null;
  isGroup: boolean;
  url: string | null;
  icon: string | null;
  sortOrder: number;
  site: NavigationSiteDetail | null;
};

export type UpdateNavigationItemInput = Omit<CreateNavigationItemInput, "menuId" | "code"> & { isActive: boolean };

export type ReorderNavigationItemsInput = {
  /** Cha mới của toàn bộ item trong `orderedItemIds` — null = mục gốc. */
  parentId: string | null;
  /** Id các item, ĐÚNG theo thứ tự mong muốn — Backend gán lại sortOrder 1..N. */
  orderedItemIds: string[];
};

/** MenuTreeNode của Backend — sidebar Admin đã lọc sẵn theo quyền. `route` null + có children = tiêu đề nhóm. */
export type AdminMenuTreeNode = {
  id: string;
  code: string;
  name: string;
  route: string | null;
  /** Tên icon lucide-react (xem utils/icon-registry.ts). */
  icon: string | null;
  sortOrder: number;
  children: AdminMenuTreeNode[];
};

/**
 * Mục menu Website đã sẵn sàng render cho khách (PublicNavigationNode của Backend, `targetType = "page"` đã được
 * resolve thành đường dẫn thật). Tiêu đề nhóm có `targetType` null và `url` null.
 */
export type NavigationItem = {
  id: string;
  label: string;
  targetType: NavigationTargetType | null;
  targetId?: string | null;
  url?: string | null;
  icon?: string | null;
  sortOrder: number;
  openInNewTab?: boolean;
  children?: NavigationItem[];
};
