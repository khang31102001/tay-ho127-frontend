import {
  ArrowRightLeft,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarRange,
  ClipboardList,
  Contact,
  CreditCard,
  FileText,
  FolderTree,
  GalleryHorizontal,
  Gauge,
  History,
  Images,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Network,
  Newspaper,
  Package,
  PanelLeft,
  Route,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
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
 * Icon lưu dưới dạng TÊN CHUỖI (dữ liệu phải serializable qua API/JSON — không
 * thể lưu component reference) — registry này resolve tên đó về component
 * Lucide thật khi render. Dùng chung cho Navigation của Site và sidebar Admin
 * (menu Backend, xem NavigationSeeder ở Backend). Thêm icon mới chỉ cần thêm 1
 * dòng ở đây, không phải sửa renderer.
 */
export const NAVIGATION_ICON_REGISTRY: Record<string, LucideIcon> = {
  ArrowRightLeft,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarRange,
  ClipboardList,
  Contact,
  CreditCard,
  FileText,
  FolderTree,
  GalleryHorizontal,
  Gauge,
  History,
  Images,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Network,
  Newspaper,
  Package,
  PanelLeft,
  Route,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
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
