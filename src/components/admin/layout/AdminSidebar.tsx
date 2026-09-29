"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useAdminSidebarMenu, type AdminMenuTreeNode } from "@/features/admin-menus";
import { resolveNavigationIcon } from "@/features/navigation";

type SidebarSection = {
  /** Để trống nếu không cần hiển thị heading. */
  title?: string;
  items: AdminMenuTreeNode[];
};

/**
 * Dựng section/group từ cây menu Backend: item gốc KHÔNG có children => 1 link
 * đứng một mình, gom chung với các item gốc không-children liền kề thành 1
 * "section không tiêu đề" (Dashboard/Người dùng/Vai trò); item gốc CÓ children
 * => section có tiêu đề = tên của chính nó, items = children. Quy tắc CHUNG
 * dựa trên cấu trúc cây, không hard-code theo tên menu cụ thể nào.
 */
function groupSidebarSections(items: AdminMenuTreeNode[]): SidebarSection[] {
  const sections: SidebarSection[] = [];
  let pendingUngrouped: AdminMenuTreeNode[] = [];

  function flushPending() {
    if (pendingUngrouped.length > 0) {
      sections.push({ items: pendingUngrouped });
      pendingUngrouped = [];
    }
  }

  items.forEach((item) => {
    if (item.children && item.children.length > 0) {
      flushPending();
      sections.push({ title: item.name, items: item.children });
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
};

/**
 * Sidebar Admin — cây menu lấy từ Backend (GET /navigation/menus), đã lọc sẵn
 * theo quyền của admin đang đăng nhập. Thêm/sửa mục menu ở Admin → Hệ thống →
 * Menu quản trị, không sửa code. Nằm trong AdminGuard nên chỉ tải khi đã có phiên.
 */
export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { menuItems, isLoading, loadError } = useAdminSidebarMenu();

  // Đóng drawer mobile khi đổi route.
  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function isItemActive(href?: string | null) {
    if (!href) return false;
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const sections = groupSidebarSections(menuItems);

  const navList = (
    <nav
      className="flex flex-col gap-4 px-3 pb-6"
      aria-label="Điều hướng quản trị"
    >
      {isLoading && <span className="px-3 text-[13px] text-brand-muted">Đang tải menu...</span>}
      {loadError && <span className="px-3 text-[13px] text-red-600">{loadError}</span>}

      {sections.map((section, sectionIndex) => (
        <div key={section.title ?? `section-${sectionIndex}`} className="flex flex-col gap-1">
          {section.title && (
            <span className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-brand-muted">
              {section.title}
            </span>
          )}

          {section.items.map((item) => {
            const isActive = isItemActive(item.route);
            const Icon = resolveNavigationIcon(item.icon);

            return (
              <Link
                key={item.id}
                href={item.route ?? "#"}
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
                <span className="truncate">{item.name}</span>
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
