import type { ReactNode } from "react";

type TreeNodeActionsProps = {
  children: ReactNode;
};

/**
 * Vùng action bên phải mỗi node — ẩn mặc định, chỉ hiện khi hover/focus vào
 * hàng (group-hover) để "không chiếm diện tích" (yêu cầu style). Nội dung
 * bên trong hoàn toàn do Feature quyết định qua renderActions — component
 * này chỉ lo layout/hiển thị, không biết action nào bên trong là gì.
 */
export function TreeNodeActions({ children }: TreeNodeActionsProps) {
  return (
    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/tree-row:opacity-100 group-focus-within/tree-row:opacity-100">
      {children}
    </div>
  );
}
