"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { TreeItem, TreeMoveEvent } from "./tree-types";

/**
 * Context NỘI BỘ giữa tree-view.tsx và tree-node.tsx — tránh phải truyền lại
 * 8-9 prop giống hệt nhau qua mỗi cấp đệ quy. KHÔNG export ra ngoài package
 * này (Feature không được đọc thẳng context, chỉ dùng qua props của
 * <TreeView />).
 */
export type TreeContextValue<T = unknown> = {
  selectedId?: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect?: (node: TreeItem<T>) => void;
  renderLabel: (node: TreeItem<T>) => ReactNode;
  renderIcon?: (node: TreeItem<T>) => ReactNode;
  renderActions?: (node: TreeItem<T>) => ReactNode;
  onMove?: (event: TreeMoveEvent) => void;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  parentByNodeId: Map<string, string | null>;
  canDrop: (nodeId: string, targetParentId: string | null) => boolean;
  registerNodeRef: (id: string, element: HTMLDivElement | null) => void;
  focusSibling: (id: string, direction: "up" | "down") => void;
  focusNodeById: (id: string) => void;
};

const TreeContext = createContext<TreeContextValue<any> | null>(null);

export function TreeProvider<T>({
  value,
  children,
}: {
  value: TreeContextValue<T>;
  children: ReactNode;
}) {
  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
}

export function useTreeContext<T>(): TreeContextValue<T> {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("TreeNode phải được render bên trong <TreeView />.");
  }
  return context;
}
