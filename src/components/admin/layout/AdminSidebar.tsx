"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { resolveNavigationIcon, type NavigationItem } from "@/features/navigation";

type SidebarSection = {
  /** Để trống nếu không cần hiển thị heading — khớp cách ADMIN_NAV_SECTIONS cũ hoạt động. */
  title?: string;
  items: NavigationItem[];
};

/**
 * Dựng lại đúng hình dạng section/group cũ (ADMIN_NAV_SECTIONS) từ cây
 * NavigationItem phẳng ở gốc: item gốc KHÔNG có children => 1 link đứng một
 * mình, gom chung với các item gốc không-children liền kề thành 1 "section
 * không tiêu đề" (giống mục Dashboard/Người dùng/Vai trò hiện tại); item gốc
 * CÓ children => section có tiêu đề = label của chính nó, items = children.
 * Đây là quy tắc CHUNG dựa trên cấu trúc cây, không hard-code theo tên menu
 * cụ thể nào.
 */
function groupSidebarSections(items: NavigationItem[]): SidebarSection[] {
  const sections: SidebarSection[] = [];
  let pendingUngrouped: NavigationItem[] = [];

  function flushPending() {
    if (pendingUngrouped.length > 0) {
      sections.push({ items: pendingUngrouped });
      pendingUngrouped = [];
    }
  }

  items.forEach((item) => {
    if (item.children && item.children.length > 0) {
      flushPending();
      sections.push({ title: item.label, items: item.children });
    } else {
      pendingUngrouped.push(item);
    }
  });

  flushPending();

  return sections;
}

type AdminSidebarProps = {
  /** Trạng thái mở của drawer trên mobile. Không ảnh hưởng desktop (luôn hiện). */
  isOpen?: boolean;
  onClose?: () => void;
  /**
   * Cây navigation vị trí "admin-sidebar" — fetch ở app/admin/(dashboard)/layout.tsx
   * (Server Component) qua navigationApi.getByLocation("admin-sidebar"), truyền
   * xuống qua AdminDashboardShell. KHÔNG hard-code ADMIN_NAV_SECTIONS ở đây nữa —
   * thêm domain admin mới giờ sửa ở Admin → Cấu hình → Navigation, không sửa code.
   */
  navigationItems: NavigationItem[];
};

export function AdminSidebar({ isOpen = false, onClose, navigationItems }: AdminSidebarProps) {
  const pathname = usePathname();

  // Đóng drawer mobile khi đổi route.
  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function isItemActive(href?: string | null) {
    if (!href) return false;
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const sections = groupSidebarSections(navigationItems);

  const navList = (
    <nav
      className="flex flex-col gap-4 px-3 pb-6"
      aria-label="Điều hướng quản trị"
    >
      {sections.map((section, sectionIndex) => (
        <div key={section.title ?? `section-${sectionIndex}`} className="flex flex-col gap-1">
          {section.title && (
            <span className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-brand-muted">
              {section.title}
            </span>
          )}

          {section.items.map((item) => {
            const isActive = isItemActive(item.url);
            const Icon = resolveNavigationIcon(item.icon);

            return (
              <Link
                key={item.id}
                href={item.url ?? "#"}
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
                {Icon && <Icon className="size-[18px] shrink-0" />}
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
