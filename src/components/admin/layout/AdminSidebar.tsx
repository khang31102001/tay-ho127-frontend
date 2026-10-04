"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";

import { resolveNavigationIcon, useAdminSidebarMenu, type AdminMenuTreeNode } from "@/features/navigation";

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
  /** Desktop: chỉ hiện icon. Drawer mobile luôn hiện đầy đủ. */
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

/**
 * Sidebar Admin — cây menu lấy từ Backend (GET /navigation/me), đã lọc sẵn
 * theo quyền của admin đang đăng nhập. Thêm/sửa mục menu ở Admin → Hệ thống →
 * Menu quản trị, không sửa code. Nằm trong AdminGuard nên chỉ tải khi đã có phiên.
 */
export function AdminSidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { menuItems, isLoading, loadError } = useAdminSidebarMenu();
  const [openGroupTitles, setOpenGroupTitles] = useState<Set<string>>(new Set());

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
  const activeGroupTitle =
    sections.find(
      (section) => section.title && section.items.some((item) => isItemActive(item.route)),
    )?.title ?? null;

  // Route đang active nằm trong group nào thì group đó tự mở (người dùng vẫn đóng lại được).
  useEffect(() => {
    if (!activeGroupTitle) return;
    setOpenGroupTitles((prev) =>
      prev.has(activeGroupTitle) ? prev : new Set(prev).add(activeGroupTitle),
    );
  }, [activeGroupTitle]);

  function toggleGroup(title: string) {
    setOpenGroupTitles((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  function renderItem(item: AdminMenuTreeNode, collapsed: boolean) {
    const isActive = isItemActive(item.route);
    const Icon = resolveNavigationIcon(item.icon);

    return (
      <Link
        key={item.id}
        href={item.route ?? "#"}
        title={collapsed ? item.name : undefined}
        aria-label={collapsed ? item.name : undefined}
        className={`
          flex items-center gap-2.5 rounded-lg py-2.5
          text-[14px] font-bold transition-colors
          ${collapsed ? "justify-center px-0" : "px-3"}
          ${
            isActive
              ? "bg-brand-green/10 text-brand-greenDark"
              : "text-brand-muted hover:bg-brand-green/5 hover:text-brand-greenDark"
          }
        `}
      >
        {Icon ? (
          <Icon className="size-[18px] shrink-0" />
        ) : (
          collapsed && (
            <span className="flex size-[18px] shrink-0 items-center justify-center text-[13px]">
              {item.name.charAt(0)}
            </span>
          )
        )}
        {!collapsed && <span className="truncate">{item.name}</span>}
      </Link>
    );
  }

  function renderNav(collapsed: boolean) {
    return (
      <nav className="flex flex-col gap-4 px-3 pb-6" aria-label="Điều hướng quản trị">
        {isLoading && !collapsed && (
          <span className="px-3 text-[13px] text-brand-muted">Đang tải menu...</span>
        )}
        {loadError && !collapsed && (
          <span className="px-3 text-[13px] text-red-600">{loadError}</span>
        )}

        {sections.map((section, sectionIndex) => {
          const sectionKey = section.title ?? `section-${sectionIndex}`;
          const items = section.items.map((item) => renderItem(item, collapsed));

          // Thu gọn: bỏ heading/accordion, chỉ còn icon, ngăn nhóm bằng đường kẻ mảnh.
          if (collapsed) {
            return (
              <div
                key={sectionKey}
                className={`flex flex-col gap-1 ${
                  sectionIndex > 0 ? "border-t border-brand-line pt-3" : ""
                }`}
              >
                {items}
              </div>
            );
          }

          if (!section.title) {
            return (
              <div key={sectionKey} className="flex flex-col gap-1">
                {items}
              </div>
            );
          }

          const groupTitle = section.title;
          const isGroupOpen = openGroupTitles.has(groupTitle);

          return (
            <div key={sectionKey} className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleGroup(groupTitle)}
                aria-expanded={isGroupOpen}
                className="flex items-center justify-between rounded-lg px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-brand-muted transition-colors hover:text-brand-greenDark"
              >
                <span className="truncate">{groupTitle}</span>
                <ChevronDown
                  className={`size-4 shrink-0 transition-transform duration-200 ${
                    isGroupOpen ? "" : "-rotate-90"
                  }`}
                />
              </button>

              {/* grid-rows 0fr↔1fr: animate chiều cao theo nội dung thật, không cần đo px. */}
              <div
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                  isGroupOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-1">{items}</div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      {/* =====================================================
       * DESKTOP / TABLET: sidebar cố định (sticky, cao bằng viewport),
       * thu gọn được — cột nội dung là flex-1 nên tự co giãn theo.
       * =================================================== */}
      <aside
        className={`
          sticky top-0 hidden h-svh shrink-0 overflow-y-auto overflow-x-hidden
          border-r border-brand-line bg-white transition-[width] duration-300 ease-out md:block
          ${isCollapsed ? "w-[72px]" : "w-[240px]"}
        `}
      >
        <div
          className={`flex h-16 items-center ${
            isCollapsed ? "justify-center" : "justify-between pl-5 pr-3"
          }`}
        >
          {!isCollapsed && (
            <span className="truncate whitespace-nowrap text-[15px] font-black text-brand-greenDark">
              Quản trị Tây Hồ 127
            </span>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-brand-muted transition hover:bg-brand-green/10 hover:text-brand-greenDark"
          >
            {isCollapsed ? (
              <ChevronsRight className="size-5" />
            ) : (
              <ChevronsLeft className="size-5" />
            )}
          </button>
        </div>

        {renderNav(isCollapsed)}
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

        {renderNav(false)}
      </aside>
    </>
  );
}
