import type { ManagedPermission, PermissionTreeNode } from "../types/permission.types";

/** Id của mọi quyền LÁ nằm dưới node (kể cả chính node nếu nó là lá), ở mọi độ sâu. */
export function collectLeafIds(node: PermissionTreeNode): string[] {
  if (!node.isGroup) return [node.id];
  return node.children.flatMap(collectLeafIds);
}

export type GroupSelectionState = "none" | "some" | "all";

/** Trạng thái tick của một node so với tập quyền lá đang chọn (nhóm rỗng luôn là "none"). */
export function getSelectionState(leafIds: string[], selected: ReadonlySet<string>): GroupSelectionState {
  if (leafIds.length === 0) return "none";
  const selectedCount = leafIds.filter((id) => selected.has(id)).length;
  if (selectedCount === 0) return "none";
  return selectedCount === leafIds.length ? "all" : "some";
}

/** Tính lại tập quyền đã chọn sau khi bật/tắt cả một nhóm: giữ nguyên id không thuộc cây (vd. quyền đã tắt). */
export function applyLeafSelection(current: readonly string[], leafIds: string[], checked: boolean): string[] {
  const next = new Set(current);
  leafIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
  return [...next];
}

export type PermissionRow = ManagedPermission & {
  /** 0 = gốc; dùng để thụt lề trong danh sách. */
  depth: number;
  parentName: string | null;
};

/** Làm phẳng danh sách quyền theo thứ tự cây (cha trước con, theo sortOrder), node mồ côi xếp cuối ở độ sâu 0. */
export function flattenPermissionsAsTree(permissions: ManagedPermission[]): PermissionRow[] {
  const byId = new Map(permissions.map((permission) => [permission.id, permission]));
  const childrenByParent = new Map<string | null, ManagedPermission[]>();

  permissions.forEach((permission) => {
    const parentKey = permission.parentId !== null && byId.has(permission.parentId) ? permission.parentId : null;
    childrenByParent.set(parentKey, [...(childrenByParent.get(parentKey) ?? []), permission]);
  });

  const rows: PermissionRow[] = [];
  const visited = new Set<string>();

  function visit(parentKey: string | null, depth: number) {
    const children = [...(childrenByParent.get(parentKey) ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    );
    children.forEach((permission) => {
      if (visited.has(permission.id)) return;
      visited.add(permission.id);
      rows.push({
        ...permission,
        depth,
        parentName: permission.parentId ? (byId.get(permission.parentId)?.name ?? null) : null,
      });
      visit(permission.id, depth + 1);
    });
  }

  visit(null, 0);
  return rows;
}

/** Độ sâu (gốc = 1) của một nhóm, để chặn chọn cha làm cây vượt giới hạn Backend. */
export function getDepth(id: string, permissions: ManagedPermission[]): number {
  const byId = new Map(permissions.map((permission) => [permission.id, permission]));
  let depth = 0;
  let currentId: string | null = id;
  while (currentId !== null && byId.has(currentId) && depth <= permissions.length) {
    depth += 1;
    currentId = byId.get(currentId)?.parentId ?? null;
  }
  return depth;
}
