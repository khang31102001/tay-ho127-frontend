"use client";

import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { StatusPopup } from "@/components/shared/StatusPopup";
import { TreeView, filterTree, collectExpandableIds, type TreeItem, type TreeViewHandle } from "@/components/shared/tree";

import { useNavigationItemsTree } from "../hooks/useNavigationItemsTree";
import { mapNavigationToTree } from "../utils/map-navigation-to-tree";
import { resolveNavigationIcon } from "../utils/icon-registry";
import type { NavigationItem } from "../types/navigation.types";

type NavigationTreeProps = {
  menuId: string;
};

/**
 * Feature-level: lấy Navigation data → map sang TreeItem<NavigationItem>
 * (mapNavigationToTree) → truyền vào <TreeView /> → định nghĩa
 * renderLabel/renderIcon/renderActions + xử lý business logic (visibility
 * toggle, xóa, kéo-thả đổi sortOrder). KHÔNG import gì từ
 * @/components/shared/tree ngoài public API (TreeView/types/utils) — mọi
 * field nghiệp vụ (url/targetType/isVisible/icon) đọc qua `node.metadata`.
 */
export function NavigationTree({ menuId }: NavigationTreeProps) {
  const { tree, menuName, isLoading, handleDelete, handleToggleVisible, handleMoveNode } =
    useNavigationItemsTree(menuId);
  const [pendingDelete, setPendingDelete] = useState<NavigationItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const treeRef = useRef<TreeViewHandle>(null);

  const treeItems = useMemo(() => mapNavigationToTree(tree), [tree]);

  // Navigation tự quyết định phần nào được tìm (label + url) — filterTree
  // (shared/tree) không đoán field nghiệp vụ.
  const getSearchText = (node: TreeItem<NavigationItem>) => `${node.label} ${node.metadata?.url ?? ""}`;

  const visibleItems = useMemo(
    () => (searchTerm.trim() ? filterTree(treeItems, searchTerm, getSearchText) : treeItems),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [treeItems, searchTerm],
  );

  function handleSearchChange(value: string) {
    setSearchTerm(value);
    if (value.trim()) {
      const filtered = filterTree(treeItems, value, getSearchText);
      treeRef.current?.expandIds(collectExpandableIds(filtered));
    }
  }

  function renderIcon(node: TreeItem<NavigationItem>) {
    const Icon = resolveNavigationIcon(node.metadata?.icon);
    return Icon ? <Icon className="size-4 shrink-0 text-brand-muted" /> : null;
  }

  function renderLabel(node: TreeItem<NavigationItem>) {
    const item = node.metadata;
    const targetLabel = item?.targetType === "page" ? "CMS Page" : item?.url || "—";

    return (
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className={`truncate text-[14px] font-bold ${
            item?.isVisible === false ? "text-brand-muted line-through" : "text-brand-ink"
          }`}
        >
          {node.label}
        </span>
        <span className="hidden max-w-[220px] truncate text-[12px] text-brand-muted sm:inline">{targetLabel}</span>
      </div>
    );
  }

  function renderActions(node: TreeItem<NavigationItem>) {
    const item = node.metadata;
    if (!item) return null;

    return (
      <>
        <button
          type="button"
          onClick={() => handleToggleVisible(item)}
          aria-label={item.isVisible ? "Ẩn mục" : "Hiện mục"}
          className="flex size-7 items-center justify-center rounded text-brand-muted transition hover:bg-brand-green/10"
        >
          {item.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>

        <Link
          href={`/admin/settings/navigation/${menuId}/items/${item.id}`}
          aria-label="Sửa"
          className="flex size-7 items-center justify-center rounded text-brand-muted transition hover:bg-brand-green/10 hover:text-brand-greenDark"
        >
          <Pencil className="size-4" />
        </Link>

        <button
          type="button"
          onClick={() => setPendingDelete(item)}
          aria-label="Xóa"
          className="flex size-7 items-center justify-center rounded text-brand-muted transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </button>
      </>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] font-black text-brand-greenDark">Cấu trúc menu — {menuName}</h1>
          <Link
            href="/admin/settings/navigation"
            className="text-[13px] font-bold text-brand-muted transition hover:text-brand-greenDark"
          >
            ← Quay lại danh sách menu
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => treeRef.current?.expandAll()}
            className="rounded-lg border border-brand-line px-3 py-2 text-[13px] font-bold text-brand-muted transition hover:border-brand-green hover:text-brand-greenDark"
          >
            Mở rộng tất cả
          </button>
          <button
            type="button"
            onClick={() => treeRef.current?.collapseAll()}
            className="rounded-lg border border-brand-line px-3 py-2 text-[13px] font-bold text-brand-muted transition hover:border-brand-green hover:text-brand-greenDark"
          >
            Thu gọn tất cả
          </button>
          <Link
            href={`/admin/settings/navigation/${menuId}/items/new`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-brand-redDark"
          >
            <Plus className="size-4" />
            Thêm mục
          </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-brand-line bg-white px-4 py-2.5">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Tìm theo tên hoặc URL..."
          className="w-full text-[14px] outline-none"
        />
      </div>

      <div className="mt-4 rounded-lg border border-brand-line bg-white p-4">
        {isLoading ? (
          <p className="py-6 text-center text-brand-muted">Đang tải dữ liệu...</p>
        ) : (
          <TreeView<NavigationItem>
            ref={treeRef}
            items={visibleItems}
            renderIcon={renderIcon}
            renderLabel={renderLabel}
            renderActions={renderActions}
            onMove={handleMoveNode}
            emptyState={
              <p className="py-6 text-center text-brand-muted">
                {searchTerm ? "Không tìm thấy mục nào phù hợp." : "Chưa có mục nào trong menu này."}
              </p>
            }
          />
        )}
      </div>

      <StatusPopup
        open={pendingDelete !== null}
        status="warning"
        title="Xác nhận xóa?"
        description={
          pendingDelete?.children?.length
            ? "Mục này có mục con — xóa sẽ xóa toàn bộ nhánh con bên dưới."
            : "Hành động này không thể hoàn tác."
        }
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        actions={[
          { id: "cancel", label: "Hủy", variant: "secondary" },
          {
            id: "confirm",
            label: "Xóa",
            variant: "danger",
            onClick: async () => {
              if (pendingDelete) {
                await handleDelete(pendingDelete);
              }
              setPendingDelete(null);
            },
          },
        ]}
      />
    </div>
  );
}
