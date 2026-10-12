"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from "react";

import { TreeProvider } from "./tree-context";
import { TreeNode } from "./tree-node";
import { TreeEmptyState } from "./tree-empty-state";
import { canDropNode, collectExpandableIds } from "./tree-utils";
import type { TreeItem, TreeMoveEvent, TreeViewHandle } from "./tree-types";

export type TreeViewProps<T = unknown> = {
  items: TreeItem<T>[];
  selectedId?: string | null;
  onSelect?: (node: TreeItem<T>) => void;
  /** Danh sách id mặc định mở rộng — không truyền = mặc định mở toàn bộ node có con. */
  defaultExpandedIds?: string[];
  renderLabel?: (node: TreeItem<T>) => ReactNode;
  renderIcon?: (node: TreeItem<T>) => ReactNode;
  renderActions?: (node: TreeItem<T>) => ReactNode;
  /** Không truyền = tắt kéo-thả hoàn toàn (node không có `draggable`). */
  onMove?: (event: TreeMoveEvent) => void;
  emptyState?: ReactNode;
  className?: string;
};

function TreeViewInner<T>(
  {
    items,
    selectedId,
    onSelect,
    defaultExpandedIds,
    renderLabel,
    renderIcon,
    renderActions,
    onMove,
    emptyState,
    className,
  }: TreeViewProps<T>,
  ref: Ref<TreeViewHandle>,
) {
  const allExpandableIds = useMemo(() => collectExpandableIds(items), [items]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(defaultExpandedIds));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const hasAppliedDefaultExpand = useRef(false);

  // `items` thường tới bất đồng bộ (fetch xong mới có), nên không dùng lazy
  // initializer của useState (chạy 1 lần lúc items còn rỗng) — áp dụng mặc
  // định mở rộng lần đầu items có dữ liệu, sau đó tôn trọng thao tác thủ công
  // của người dùng (không ghi đè lại nữa).
  useEffect(() => {
    if (!hasAppliedDefaultExpand.current && items.length > 0) {
      setExpandedIds(new Set(defaultExpandedIds ?? allExpandableIds));
      hasAppliedDefaultExpand.current = true;
    }
  }, [items, allExpandableIds, defaultExpandedIds]);

  const parentByNodeId = useMemo(() => {
    const map = new Map<string, string | null>();

    function walk(nodes: TreeItem<T>[], parentId: string | null) {
      nodes.forEach((node) => {
        map.set(node.id, parentId);
        if (node.children) walk(node.children, node.id);
      });
    }

    walk(items, null);
    return map;
  }, [items]);

  const visibleIdsInOrder = useMemo(() => {
    const ids: string[] = [];

    function walk(nodes: TreeItem<T>[]) {
      nodes.forEach((node) => {
        if (node.hidden) return;
        ids.push(node.id);
        if (node.children && expandedIds.has(node.id)) walk(node.children);
      });
    }

    walk(items);
    return ids;
  }, [items, expandedIds]);

  const onToggleExpand = useCallback((id: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const registerNodeRef = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) nodeRefs.current.set(id, element);
    else nodeRefs.current.delete(id);
  }, []);

  const focusNodeById = useCallback((id: string) => {
    nodeRefs.current.get(id)?.focus();
  }, []);

  const focusSibling = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = visibleIdsInOrder.indexOf(id);
      if (index === -1) return;

      const targetIndex = direction === "down" ? index + 1 : index - 1;
      const targetId = visibleIdsInOrder[targetIndex];
      if (targetId) focusNodeById(targetId);
    },
    [visibleIdsInOrder, focusNodeById],
  );

  const canDrop = useCallback(
    (nodeId: string, targetParentId: string | null) => canDropNode(items, nodeId, targetParentId),
    [items],
  );

  useImperativeHandle(
    ref,
    () => ({
      expandAll: () => setExpandedIds(new Set(allExpandableIds)),
      collapseAll: () => setExpandedIds(new Set()),
      expandIds: (ids: string[]) => setExpandedIds((previous) => new Set([...previous, ...ids])),
    }),
    [allExpandableIds],
  );

  const defaultRenderLabel = useCallback(
    (node: TreeItem<T>) => <span className="truncate text-[14px] font-bold text-brand-ink">{node.label}</span>,
    [],
  );

  if (items.length === 0) {
    return <>{emptyState ?? <TreeEmptyState />}</>;
  }

  return (
    <TreeProvider
      value={{
        selectedId,
        expandedIds,
        onToggleExpand,
        onSelect,
        renderLabel: renderLabel ?? defaultRenderLabel,
        renderIcon,
        renderActions,
        onMove,
        draggingId,
        setDraggingId,
        parentByNodeId,
        canDrop,
        registerNodeRef,
        focusSibling,
        focusNodeById,
      }}
    >
      <ul role="tree" className={className ?? "space-y-0.5"}>
        {items.map((node) => (
          <TreeNode key={node.id} node={node} depth={0} />
        ))}
      </ul>
    </TreeProvider>
  );
}

/**
 * Public API — generic qua <T>, tương tác với dữ liệu qua props (items,
 * selectedId, onSelect, renderLabel/Icon/Actions, onMove) — không import bất
 * kỳ file nào từ features/*. Feature nào cũng dùng được, chỉ cần map dữ liệu
 * của mình về TreeItem<T> (xem tree-types.ts).
 */
export const TreeView = forwardRef(TreeViewInner) as <T>(
  props: TreeViewProps<T> & RefAttributes<TreeViewHandle>,
) => ReactElement | null;
