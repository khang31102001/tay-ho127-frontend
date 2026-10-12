import type { TreeItem } from "./tree-types";

/**
 * Lọc cây theo từ khóa — Feature tự quyết định phần nào của node được tìm
 * (getSearchText), TreeView/utils không đoán field nghiệp vụ. Nếu 1 con
 * match, cha của nó tự động được giữ lại trong kết quả (để hiển thị/expand).
 */
export function filterTree<T>(
  items: TreeItem<T>[],
  searchTerm: string,
  getSearchText: (node: TreeItem<T>) => string,
): TreeItem<T>[] {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  if (!normalizedTerm) return items;

  function filterNode(node: TreeItem<T>): TreeItem<T> | null {
    const filteredChildren = (node.children ?? [])
      .map(filterNode)
      .filter((child): child is TreeItem<T> => child !== null);

    const selfMatches = getSearchText(node).toLowerCase().includes(normalizedTerm);

    if (selfMatches || filteredChildren.length > 0) {
      return { ...node, children: node.children ? filteredChildren : node.children };
    }

    return null;
  }

  return items.map(filterNode).filter((node): node is TreeItem<T> => node !== null);
}

/** Toàn bộ id của node CÓ children — dùng để auto-expand khi search ra kết quả (xem filterTree). */
export function collectExpandableIds<T>(items: TreeItem<T>[]): string[] {
  const ids: string[] = [];

  function walk(nodes: TreeItem<T>[]) {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        ids.push(node.id);
        walk(node.children);
      }
    });
  }

  walk(items);
  return ids;
}

function findNode<T>(items: TreeItem<T>[], id: string): TreeItem<T> | null {
  for (const node of items) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** true nếu `descendantId` nằm trong nhánh con (ở bất kỳ cấp nào) của `nodeId`. */
export function isDescendant<T>(items: TreeItem<T>[], nodeId: string, descendantId: string): boolean {
  const node = findNode(items, nodeId);
  if (!node?.children) return false;

  function contains(nodes: TreeItem<T>[]): boolean {
    return nodes.some((child) => child.id === descendantId || (child.children ? contains(child.children) : false));
  }

  return contains(node.children);
}

/**
 * Validation cấu trúc CHUNG (không phải business rule) — chặn 2 trường hợp
 * luôn luôn sai với bất kỳ domain nào: 1 node làm cha của chính nó, hoặc thả
 * vào chính hậu duệ của nó (tạo vòng lặp). Business rule riêng của từng
 * domain (vd. "MAIN_HEADER không được nằm dưới MenuItem") phải tự Feature
 * kiểm tra thêm trước khi gọi API — không đặt ở đây.
 */
export function canDropNode<T>(items: TreeItem<T>[], nodeId: string, targetParentId: string | null): boolean {
  if (targetParentId === null) return true;
  if (targetParentId === nodeId) return false;
  return !isDescendant(items, nodeId, targetParentId);
}
