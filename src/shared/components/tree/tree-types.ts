import type { ReactNode } from "react";

/**
 * Node cây generic — KHÔNG chứa field nghiệp vụ (route/url/status/code...).
 * Mọi dữ liệu nghiệp vụ nằm trong `metadata` — Feature tự định nghĩa T và tự
 * đọc lại `node.metadata` trong renderLabel/renderIcon/renderActions của
 * mình. TreeView chỉ biết node/children/label/icon/disabled/hidden/metadata.
 */
export type TreeItem<T = unknown> = {
  id: string;
  parentId?: string | null;
  label: string;
  icon?: ReactNode;
  children?: TreeItem<T>[];
  /** Node không tương tác được (không chọn/kéo) nhưng vẫn hiển thị mờ. */
  disabled?: boolean;
  /** Node không render — khác với "ẩn khỏi Site" của Navigation (đó là business state, đặt trong metadata). */
  hidden?: boolean;
  metadata?: T;
};

export type TreeNodeAction<T = unknown> = {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (node: TreeItem<T>) => void;
  disabled?: boolean;
};

/**
 * Sự kiện TreeView emit khi kéo-thả xong — TreeView KHÔNG tự persist, chỉ
 * validate cấu trúc chung (không tự làm cha chính nó / không thả vào hậu duệ
 * của chính nó). Feature chịu trách nhiệm gọi API + validate business rule
 * riêng rồi mới lưu.
 */
export type TreeMoveEvent = {
  nodeId: string;
  fromParentId: string | null;
  toParentId: string | null;
  newIndex: number;
};

/** API imperative cho hành động không thuộc về 1 node cụ thể (toolbar ngoài TreeView). */
export type TreeViewHandle = {
  expandAll: () => void;
  collapseAll: () => void;
  expandIds: (ids: string[]) => void;
};
