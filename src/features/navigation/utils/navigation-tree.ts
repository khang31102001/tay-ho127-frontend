import type { ManagedNavigationItem, NavigationItem, NavigationTreeItem } from "../types/navigation.types";

/** true nếu đi ngược parentId từ item này gặp lại chính nó — tránh đệ quy vô hạn khi dữ liệu bị hỏng. */
function hasCycle(itemId: string, itemById: Map<string, NavigationTreeItem>): boolean {
  const visited = new Set<string>([itemId]);
  let current = itemById.get(itemId);

  while (current?.parentId) {
    if (visited.has(current.parentId)) return true;
    visited.add(current.parentId);
    current = itemById.get(current.parentId);
  }

  return false;
}

/**
 * Dựng cây từ danh sách phẳng (parentId) — có defensive handling: item có
 * parentId trỏ tới id không tồn tại, hoặc tạo thành chu trình (vd. A→B→A),
 * đều được coi là root thay vì làm crash hoặc lặp vô hạn.
 */
export function buildNavigationTree(flatItems: ManagedNavigationItem[]): NavigationTreeItem[] {
  const itemById = new Map<string, NavigationTreeItem>(flatItems.map((item) => [item.id, { ...item, children: [] }]));

  const roots: NavigationTreeItem[] = [];

  itemById.forEach((item) => {
    const parentId = item.parentId;
    const parentExists = parentId !== null && itemById.has(parentId);
    const isCyclic = parentExists && hasCycle(item.id, itemById);

    if (parentExists && !isCyclic) {
      itemById.get(parentId as string)!.children.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
}

/** Sắp toàn bộ cây theo sortOrder ASC, đệ quy ở mọi cấp — không phụ thuộc thứ tự mảng gốc. */
export function sortNavigationTree(items: NavigationTreeItem[]): NavigationTreeItem[] {
  return [...items]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({ ...item, children: sortNavigationTree(item.children) }));
}

/** Id của item và mọi con cháu của nó — để loại khỏi danh sách chọn cha (không thể làm con của chính mình). */
export function collectDescendantIds(itemId: string, flatItems: ManagedNavigationItem[]): Set<string> {
  const ids = new Set<string>([itemId]);
  let previousSize = 0;
  while (ids.size !== previousSize) {
    previousSize = ids.size;
    flatItems.forEach((item) => {
      if (item.parentId && ids.has(item.parentId)) ids.add(item.id);
    });
  }
  return ids;
}

/** Độ sâu (gốc = 1) của một item trong danh sách phẳng. */
export function getItemDepth(itemId: string, flatItems: ManagedNavigationItem[]): number {
  const byId = new Map(flatItems.map((item) => [item.id, item]));
  let depth = 0;
  let currentId: string | null = itemId;
  while (currentId !== null && byId.has(currentId) && depth <= flatItems.length) {
    depth += 1;
    currentId = byId.get(currentId)?.parentId ?? null;
  }
  return depth;
}

/** Số cấp của nhánh bắt đầu từ item (item không có con = 1). */
export function getSubtreeHeight(itemId: string, flatItems: ManagedNavigationItem[]): number {
  const childrenByParent = new Map<string, ManagedNavigationItem[]>();
  flatItems.forEach((item) => {
    if (item.parentId) childrenByParent.set(item.parentId, [...(childrenByParent.get(item.parentId) ?? []), item]);
  });

  let height = 1;
  let level = [itemId];
  const visited = new Set(level);
  for (;;) {
    const next = level
      .flatMap((id) => childrenByParent.get(id) ?? [])
      .filter((child) => !visited.has(child.id))
      .map((child) => child.id);
    if (next.length === 0) return height;
    next.forEach((id) => visited.add(id));
    height += 1;
    level = next;
  }
}

/** Điều hướng dùng để quyết định target/rel — 1 chỗ duy nhất, không hard-code theo từng menu. */
export function resolveNavigationLinkProps(item: Pick<NavigationItem, "targetType" | "url" | "openInNewTab">) {
  const isExternal = item.targetType === "external";

  return {
    href: item.url ?? "#",
    isExternal,
    target: item.openInNewTab || isExternal ? "_blank" : undefined,
    rel: item.openInNewTab || isExternal ? "noopener noreferrer" : undefined,
  };
}
