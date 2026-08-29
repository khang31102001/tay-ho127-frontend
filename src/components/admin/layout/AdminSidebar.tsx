"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
  ShieldCheck,
  Store,
  Tags,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type AdminNavSection = {
  /** Tiêu đề nhóm, để trống nếu không cần hiển thị heading. */
  title?: string;
  items: AdminNavItem[];
};

// Thêm domain admin mới chỉ cần thêm 1 phần tử vào section phù hợp
// (hoặc tạo section mới nếu là một nhóm nghiệp vụ riêng).
const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Người dùng", icon: Users },
      { href: "/admin/roles", label: "Vai trò", icon: ShieldCheck },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/sales/orders", label: "Đơn hàng", icon: ClipboardList },
      { href: "/admin/sales/customers", label: "Khách hàng", icon: Contact },
      { href: "/admin/sales/payments", label: "Thanh toán", icon: CreditCard },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/catalog/categories", label: "Danh mục", icon: FolderTree },
      { href: "/admin/catalog/media", label: "Media", icon: Images },
      { href: "/admin/catalog/products", label: "Sản phẩm", icon: Package },
      { href: "/admin/catalog/menus", label: "Thực đơn", icon: BookOpen },
      { href: "/admin/catalog/menu-products", label: "Liên kết Menu-SP", icon: ListChecks },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/content/pages", label: "Page", icon: FileText },
      { href: "/admin/content/banners", label: "Banner", icon: GalleryHorizontal },
      { href: "/admin/content/articles", label: "Bài viết", icon: Newspaper },
      { href: "/admin/content/article-categories", label: "Danh mục bài viết", icon: FolderTree },
      { href: "/admin/content/article-tags", label: "Thẻ bài viết", icon: Tags },
    ],
  },
  {
    title: "Brand",
    items: [{ href: "/admin/brand/settings", label: "Cài đặt thương hiệu", icon: Store }],
  },
  {
    title: "Cấu hình",
    items: [
      { href: "/admin/settings/payment-methods", label: "Phương thức thanh toán", icon: Wallet },
      { href: "/admin/settings/delivery-methods", label: "Phương thức giao hàng", icon: Truck },
    ],
  },
];

type AdminSidebarProps = {
  /** Trạng thái mở của drawer trên mobile. Không ảnh hưởng desktop (luôn hiện). */
  isOpen?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  // Đóng drawer mobile khi đổi route.
  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function isItemActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const navList = (
    <nav
      className="flex flex-col gap-4 px-3 pb-6"
      aria-label="Điều hướng quản trị"
    >
      {ADMIN_NAV_SECTIONS.map((section, sectionIndex) => (
        <div key={section.title ?? `section-${sectionIndex}`} className="flex flex-col gap-1">
          {section.title && (
            <span className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-brand-muted">
              {section.title}
            </span>
          )}

          {section.items.map((item) => {
            const isActive = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2.5 rounded-lg px-3 py-2.5
                  text-[14px] font-bold transition-colors
                  ${
                    isActive
                      ? "bg-brand-green/10 text-brand-greenDark"
                      : "text-brand-muted hover:bg-brand-green/5 hover:text-brand-greenDark"
                  }
                `}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* =====================================================
       * DESKTOP / TABLET: sidebar cố định
       * =================================================== */}
      <aside className="hidden w-[240px] shrink-0 overflow-y-auto border-r border-brand-line bg-white md:block">
        <div className="px-5 py-6">
          <span className="text-[15px] font-black text-brand-greenDark">
            Quản trị Tây Hồ 127
          </span>
        </div>

        {navList}
      </aside>

      {/* =====================================================
       * MOBILE: drawer trượt từ trái, mở bằng nút hamburger ở AdminHeader
       * =================================================== */}
      {isOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[260px]
          -translate-x-full overflow-y-auto bg-white shadow-xl
          transition-transform duration-300 ease-out
          md:hidden
          ${isOpen ? "translate-x-0" : ""}
        `}
      >
        <div className="px-5 py-6">
          <span className="text-[15px] font-black text-brand-greenDark">
            Quản trị Tây Hồ 127
          </span>
        </div>

        {navList}
      </aside>
    </>
  );
}
