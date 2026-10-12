"use client";

import { useMemo } from "react";

import type { PermissionTreeNode } from "../types/permission.types";
import { collectLeafIds, getSelectionState } from "../utils/permission-tree";

type PermissionTreeProps = {
  nodes: PermissionTreeNode[];
  /** Id các quyền LÁ đang được chọn. */
  selectedIds: readonly string[];
  /** Bật/tắt một tập quyền lá cùng lúc: một lá, hoặc mọi lá con cháu của một nhóm. */
  onToggleLeaves: (leafIds: string[], checked: boolean) => void;
  disabled?: boolean;
};

/**
 * Bộ chọn quyền dạng cây (Module → Nhóm tài nguyên → Quyền). Tick một nhóm = tick mọi quyền lá bên dưới;
 * bỏ tick từng lá vẫn được (nhóm chuyển sang trạng thái "một phần"). Chỉ quyền lá được lưu vào vai trò.
 */
export function PermissionTree({ nodes, selectedIds, onToggleLeaves, disabled = false }: PermissionTreeProps) {
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <div className="space-y-3">
      {nodes.map((node) => (
        <PermissionTreeBranch
          key={node.id}
          node={node}
          depth={0}
          selected={selected}
          onToggleLeaves={onToggleLeaves}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

type PermissionTreeBranchProps = {
  node: PermissionTreeNode;
  depth: number;
  selected: ReadonlySet<string>;
  onToggleLeaves: (leafIds: string[], checked: boolean) => void;
  disabled: boolean;
};

function PermissionTreeBranch({ node, depth, selected, onToggleLeaves, disabled }: PermissionTreeBranchProps) {
  const leafIds = useMemo(() => collectLeafIds(node), [node]);
  const state = getSelectionState(leafIds, selected);

  if (!node.isGroup) {
    return (
      <label className="flex items-center gap-2 text-[13px] font-medium text-brand-ink">
        <input
          type="checkbox"
          disabled={disabled}
          checked={state === "all"}
          onChange={(event) => onToggleLeaves(leafIds, event.target.checked)}
          className="size-4 accent-brand-green"
        />
        <span>
          {node.name}
          <span className="ml-1 font-mono text-[11px] text-brand-muted">{node.code}</span>
        </span>
      </label>
    );
  }

  const isModule = depth === 0;

  return (
    <fieldset className={isModule ? "rounded-lg border border-brand-line px-3 py-2" : "mt-2"}>
      <legend className="px-1">
        <label className={`flex items-center gap-2 ${isModule ? "text-[14px] font-black" : "text-[13px] font-bold"} text-brand-greenDark`}>
          <input
            type="checkbox"
            disabled={disabled || leafIds.length === 0}
            checked={state === "all"}
            ref={(element) => {
              if (element) element.indeterminate = state === "some";
            }}
            onChange={(event) => onToggleLeaves(leafIds, event.target.checked)}
            className="size-4 accent-brand-green"
          />
          {node.name}
          <span className="text-[11px] font-medium text-brand-muted">
            ({leafIds.filter((id) => selected.has(id)).length}/{leafIds.length})
          </span>
        </label>
      </legend>

      <div className={isModule ? "grid gap-x-6 gap-y-1 sm:grid-cols-2" : "ml-6 grid gap-1 sm:grid-cols-2"}>
        {node.children.map((child) => (
          <div key={child.id} className={child.isGroup ? "sm:col-span-2" : undefined}>
            <PermissionTreeBranch
              node={child}
              depth={depth + 1}
              selected={selected}
              onToggleLeaves={onToggleLeaves}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}
