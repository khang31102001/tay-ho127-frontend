"use client";

import { useMemo, useState } from "react";

import type { TreeMoveEvent } from "@/components/shared/tree";
import { useAsyncData } from "@/hooks/useAsyncData";

import { deleteItem, listItemsByMenuId, reorderItems, updateItem } from "../services/navigation.service";
import type { ManagedNavigationItem, NavigationScope, NavigationTreeItem } from "../types/navigation.types";
import { buildNavigationTree, sortNavigationTree } from "../utils/navigation-tree";
import { useNavigationMenu } from "./useNavigationMenu";

export function useNavigationItemsTree(scope: NavigationScope, menuIdParam?: string) {
  const menu = useNavigationMenu(scope, menuIdParam);
  const menuId = menu.data?.id;

  const items = useAsyncData(() => listItemsByMenuId(menuId ?? ""), [menuId], {
    enabled: menuId !== undefined,
    fallbackError: "Không thể tải cấu trúc menu.",
  });
  const flatItems = useMemo(() => items.data ?? [], [items.data]);

  // Cây chỉ dùng để HIỂN THỊ trong Admin: gồm cả mục đang tắt (Admin phải thấy để bật lại).
  const tree = useMemo(() => sortNavigationTree(buildNavigationTree(flatItems)), [flatItems]);

  // Lỗi từ Backend (vd. 409 xóa mục còn con, 400 vượt độ sâu) hiện cho Admin thay vì ném ra ngoài.
  const [actionError, setActionError] = useState<string | null>(null);

  async function runAction(action: () => Promise<void>) {
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể thực hiện thao tác.");
    } finally {
      await items.reload();
    }
  }

  const handleDelete = (item: NavigationTreeItem) => runAction(() => deleteItem(item.id));

  /** Bật/tắt hiển thị: Backend nhận cả payload của item nên gửi lại nguyên các field khác. */
  const handleToggleActive = (item: ManagedNavigationItem) =>
    runAction(() =>
      updateItem(item.id, {
        label: item.label,
        isActive: !item.isActive,
        parentId: item.parentId,
        isGroup: item.isGroup,
        url: item.url,
        icon: item.icon,
        sortOrder: item.sortOrder,
        site: item.site,
      }).then(() => undefined),
    );

  /**
   * Xử lý sự kiện kéo-thả từ TreeView (generic, chỉ emit { nodeId, fromParentId, toParentId, newIndex }) —
   * Navigation tự dựng lại danh sách id đúng thứ tự cho cha mới (chèn tại newIndex) và, nếu đổi cha, cho cả cha
   * cũ (để dồn lại sortOrder không có khoảng trống), rồi gọi reorderItems — Backend là nơi DUY NHẤT gán số
   * sortOrder thật và kiểm tra vòng lặp/độ sâu.
   */
  function handleMoveNode(event: TreeMoveEvent) {
    if (menuId === undefined) return Promise.resolve();

    return runAction(async () => {
      const { nodeId, fromParentId, toParentId, newIndex } = event;
      const siblingIds = (parentId: string | null) =>
        flatItems
          .filter((item) => item.parentId === parentId && item.id !== nodeId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => item.id);

      const targetSiblingIds = siblingIds(toParentId);
      targetSiblingIds.splice(newIndex, 0, nodeId);
      await reorderItems(menuId, { parentId: toParentId, orderedItemIds: targetSiblingIds });

      if (fromParentId !== toParentId) {
        const sourceSiblingIds = siblingIds(fromParentId);
        if (sourceSiblingIds.length > 0) {
          await reorderItems(menuId, { parentId: fromParentId, orderedItemIds: sourceSiblingIds });
        }
      }
    });
  }

  return {
    tree,
    menu: menu.data,
    isLoading: menu.isLoading || items.isLoading,
    loadError: menu.error ?? items.error,
    actionError,
    clearActionError: () => setActionError(null),
    handleDelete,
    handleToggleActive,
    handleMoveNode,
  };
}
