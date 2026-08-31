"use client";

import { memo, type KeyboardEvent, type MouseEvent, type DragEvent } from "react";
import { ChevronRight } from "lucide-react";

import { useTreeContext } from "./tree-context";
import { TreeNodeActions } from "./tree-node-actions";
import type { TreeItem } from "./tree-types";

const INDENT_PX = 20;

type TreeNodeProps<T> = {
  node: TreeItem<T>;
  depth: number;
};

function TreeNodeInner<T>({ node, depth }: TreeNodeProps<T>) {
  const {
    selectedId,
    expandedIds,
    onToggleExpand,
    onSelect,
    renderLabel,
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
  } = useTreeContext<T>();

  if (node.hidden) return null;

  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isDraggable = Boolean(onMove) && !node.disabled;
  const isDropTarget = Boolean(onMove) && draggingId !== null && draggingId !== node.id && canDrop(draggingId, node.id);
  const isDraggingSelf = draggingId === node.id;

  function handleToggle(event: MouseEvent) {
    event.stopPropagation();
    if (hasChildren) onToggleExpand(node.id);
  }

  function handleSelect() {
    if (node.disabled) return;
    onSelect?.(node);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        handleSelect();
        break;
      case "ArrowRight":
        event.preventDefault();
        if (hasChildren && !isExpanded) {
          onToggleExpand(node.id);
        } else if (hasChildren) {
          focusSibling(node.id, "down");
        }
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (hasChildren && isExpanded) {
          onToggleExpand(node.id);
        } else {
          const parentId = parentByNodeId.get(node.id);
          if (parentId) focusNodeById(parentId);
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        focusSibling(node.id, "down");
        break;
      case "ArrowUp":
        event.preventDefault();
        focusSibling(node.id, "up");
        break;
    }
  }

  function handleDragStart(event: DragEvent) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.id);
    setDraggingId(node.id);
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  function handleDragOver(event: DragEvent) {
    if (!isDropTarget) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    if (!draggingId || !isDropTarget || !onMove) return;

    const fromParentId = parentByNodeId.get(draggingId) ?? null;
    onMove({
      nodeId: draggingId,
      fromParentId,
      toParentId: node.id,
      newIndex: node.children?.length ?? 0,
    });
    setDraggingId(null);
  }

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected} aria-level={depth + 1}>
      <div
        ref={(element) => registerNodeRef(node.id, element)}
        tabIndex={0}
        role="none"
        draggable={isDraggable}
        onDragStart={isDraggable ? handleDragStart : undefined}
        onDragEnd={isDraggable ? handleDragEnd : undefined}
        onDragOver={onMove ? handleDragOver : undefined}
        onDrop={onMove ? handleDrop : undefined}
        onKeyDown={handleKeyDown}
        onClick={handleSelect}
        style={{ paddingLeft: `${depth * INDENT_PX + 8}px` }}
        className={`group/tree-row focus-ring flex cursor-pointer items-center gap-1.5 rounded-lg py-2 pr-2 outline-none transition-colors ${
          isSelected ? "bg-brand-green/10" : "hover:bg-brand-cream/60"
        } ${node.disabled ? "cursor-not-allowed opacity-50" : ""} ${isDropTarget ? "ring-2 ring-inset ring-brand-green/50" : ""} ${
          isDraggingSelf ? "opacity-40" : ""
        }`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden={!hasChildren}
          onClick={handleToggle}
          className={`flex size-5 shrink-0 items-center justify-center rounded text-brand-muted transition-transform ${
            hasChildren ? "hover:bg-brand-green/10" : "invisible"
          } ${isExpanded ? "rotate-90" : ""}`}
        >
          {hasChildren && <ChevronRight className="size-3.5" />}
        </button>

        {renderIcon?.(node)}

        <div className="min-w-0 flex-1">{renderLabel(node)}</div>

        {renderActions && <TreeNodeActions>{renderActions(node)}</TreeNodeActions>}
      </div>

      {hasChildren && isExpanded && (
        <ul role="group" className="ml-[18px] border-l border-brand-line/60">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

// React.memo giữ nguyên generic qua type assertion — tránh re-render toàn
// cây khi chỉ 1 node đổi state (chỉ có giá trị khi tree vài trăm node, xem
// mục Performance) — không áp dụng thêm useMemo/useCallback nếu chưa đo được
// vấn đề thực tế.
export const TreeNode = memo(TreeNodeInner) as typeof TreeNodeInner;
