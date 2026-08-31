import type { TreeItem } from "@/components/shared/tree";

import type { NavigationItem } from "../types/navigation.types";

/**
 * Feature Adapter — nơi DUY NHẤT chuyển dữ liệu Navigation sang hình dạng
 * generic mà TreeView hiểu được. Toàn bộ field nghiệp vụ (url/targetType/
 * icon/isVisible...) giữ nguyên trong `metadata` — TreeView không đọc trực
 * tiếp field nào trong số này, chỉ Navigation tự đọc lại qua renderLabel/
 * renderIcon/renderActions của chính mình (xem NavigationTree.tsx).
 */
export function mapNavigationToTree(items: NavigationItem[]): TreeItem<NavigationItem>[] {
  return items.map((item) => ({
    id: item.id,
    parentId: item.parentId,
    label: item.label,
    children: item.children ? mapNavigationToTree(item.children) : undefined,
    metadata: item,
  }));
}
