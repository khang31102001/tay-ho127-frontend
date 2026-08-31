"use client";

import { useCallback, useEffect, useState } from "react";

import type { TreeMoveEvent } from "@/components/shared/tree";

import { navigationApi } from "../api/navigation.api";
import { buildNavigationTree, sortNavigationTree } from "../utils/navigation-tree";
import type { ManagedNavigationItem, NavigationItem } from "../types/navigation.types";

export function useNavigationItemsTree(menuId: string) {
  const [flatItems, setFlatItems] = useState<ManagedNavigationItem[]>([]);
  const [menuName, setMenuName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [items, menu] = await Promise.all([
        navigationApi.getItemsByMenuId(menuId),
        navigationApi.getById(menuId),
      ]);
      setFlatItems(items);
      setMenuName(menu?.name ?? "");
    } finally {
      setIsLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    load();
  }, [load]);

  // Cây chỉ dùng để HIỂN THỊ trong Admin (chưa lọc isVisible — Admin phải
  // nhìn thấy cả mục đang ẩn để bật lại) — khác getAssembledMenuByLocation
  // dùng cho Site (đã lọc + resolve URL).
  const tree = sortNavigationTree(buildNavigationTree(flatItems));

  async function handleDelete(item: NavigationItem) {
    await navigationApi.deleteItem(item.id);
    await load();
  }

  async function handleToggleVisible(item: NavigationItem) {
    await navigationApi.toggleItemVisibility(item.id);
    await load();
  }

  async function handleMove(item: NavigationItem, direction: "up" | "down") {
    const siblingIds = flatItems
      .filter((flat) => flat.parentId === item.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((flat) => flat.id);

    const index = siblingIds.indexOf(item.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapIndex < 0 || swapIndex >= siblingIds.length) return;

    // Đổi chỗ 2 phần tử trong mảng id rồi gửi cả danh sách — service tự gán lại sortOrder tuần tự.
    [siblingIds[index], siblingIds[swapIndex]] = [siblingIds[swapIndex], siblingIds[index]];

    await navigationApi.reorderItems(menuId, { parentId: item.parentId ?? null, orderedItemIds: siblingIds });
    await load();
  }

  /**
   * Xử lý sự kiện kéo-thả từ TreeView (generic, chỉ emit { nodeId,
   * fromParentId, toParentId, newIndex }) — Navigation tự dựng lại danh sách
   * id đúng thứ tự cho cha mới (chèn tại newIndex) và, nếu đổi cha, cho cả
   * cha cũ (để dồn lại sortOrder không có khoảng trống), rồi gọi
   * reorderItems — service là nơi DUY NHẤT gán số sortOrder thật. TreeView
   * đã tự chặn 2 trường hợp cấu trúc luôn sai (tự làm cha chính mình / thả
   * vào hậu duệ của mình) trước khi gọi tới đây — Navigation hiện chưa có
   * thêm business rule riêng nào cần chặn bổ sung ở bước này.
   */
  async function handleMoveNode(event: TreeMoveEvent) {
    const { nodeId, fromParentId, toParentId, newIndex } = event;
    const moving = flatItems.find((item) => item.id === nodeId);
    if (!moving) return;

    const targetSiblingIds = flatItems
      .filter((item) => item.parentId === toParentId && item.id !== nodeId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => item.id);
    targetSiblingIds.splice(newIndex, 0, nodeId);

    const reorderCalls = [navigationApi.reorderItems(menuId, { parentId: toParentId, orderedItemIds: targetSiblingIds })];

    if (fromParentId !== toParentId) {
      const sourceSiblingIds = flatItems
        .filter((item) => item.parentId === fromParentId && item.id !== nodeId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.id);
      reorderCalls.push(navigationApi.reorderItems(menuId, { parentId: fromParentId, orderedItemIds: sourceSiblingIds }));
    }

    await Promise.all(reorderCalls);
    await load();
  }

  return { tree, menuName, isLoading, handleDelete, handleToggleVisible, handleMove, handleMoveNode };
}
