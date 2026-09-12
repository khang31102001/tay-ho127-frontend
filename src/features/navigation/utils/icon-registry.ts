import {
  BookOpen,
  ClipboardList,
  Contact,
  CreditCard,
  FileText,
  FolderTree,
  GalleryHorizontal,
  Images,
  LayoutDashboard,
  ListChecks,
  Newspaper,
  Package,
  Route,
  ShieldCheck,
  Store,
  Tags,
  TicketPercent,
  Truck,
  Users,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * NavigationItem.icon lưu dưới dạng TÊN CHUỖI (dữ liệu phải serializable qua
 * API/JSON — không thể lưu component reference) — registry này resolve tên
 * đó về component Lucide thật khi render. Thêm icon mới cho Navigation chỉ
 * cần thêm 1 dòng ở đây, không phải sửa renderer.
 */
export const NAVIGATION_ICON_REGISTRY: Record<string, LucideIcon> = {
  BookOpen,
  ClipboardList,
  Contact,
  CreditCard,
  FileText,
  FolderTree,
  GalleryHorizontal,
  Images,
  LayoutDashboard,
  ListChecks,
  Newspaper,
  Package,
  Route,
  ShieldCheck,
  Store,
  Tags,
  TicketPercent,
  Truck,
  Users,
  Utensils,
  Wallet,
};

export const NAVIGATION_ICON_NAMES = Object.keys(NAVIGATION_ICON_REGISTRY);

export function resolveNavigationIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  return NAVIGATION_ICON_REGISTRY[name] ?? null;
}
