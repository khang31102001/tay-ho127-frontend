import type { ManagedNavigationItem, NavigationItem } from "../types/navigation.types";

type BuildableItem = Omit<ManagedNavigationItem, "menuId"> & { children: NavigationItem[] };

/** true nếu đi ngược parentId từ item này gặp lại chính nó — tránh đệ quy vô hạn khi dữ liệu bị hỏng. */
function hasCycle(itemId: string, itemById: Map<string, BuildableItem>): boolean {
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
export function buildNavigationTree(flatItems: ManagedNavigationItem[]): NavigationItem[] {
  const itemById = new Map<string, BuildableItem>(
    flatItems.map((item) => [item.id, { ...item, children: [] }]),
  );

  const roots: NavigationItem[] = [];

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
export function sortNavigationTree(items: NavigationItem[]): NavigationItem[] {
  return [...items]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => (item.children ? { ...item, children: sortNavigationTree(item.children) } : item));
}

/** Lọc bỏ item isVisible=false VÀ toàn bộ nhánh con của nó (không thể điều hướng tới con của 1 mục ẩn). */
export function filterVisibleTree(items: NavigationItem[]): NavigationItem[] {
  return items
    .filter((item) => item.isVisible)
    .map((item) => (item.children ? { ...item, children: filterVisibleTree(item.children) } : item));
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
