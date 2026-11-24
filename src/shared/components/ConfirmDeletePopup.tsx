"use client";

import type { ReactNode } from "react";

import { StatusPopup } from "./StatusPopup";

type ConfirmDeletePopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chạy khi người dùng bấm "Xóa". Popup tự đóng sau đó. */
  onConfirm: () => void | Promise<void>;
  title?: ReactNode;
  description?: ReactNode;
};

/**
 * Popup xác nhận xóa dùng chung cho các nút xóa nằm trong form (xóa dòng/lựa chọn chưa lưu...).
 * Xóa bản ghi đã lưu đã có xác nhận sẵn trong DataExplorer/DataEditor — không dùng lại component này ở đó.
 */
export function ConfirmDeletePopup({
  open,
  onOpenChange,
  onConfirm,
  title = "Xác nhận xóa?",
  description = "Hành động này không thể hoàn tác.",
}: ConfirmDeletePopupProps) {
  return (
    <StatusPopup
      open={open}
      status="warning"
      title={title}
      description={description}
      onOpenChange={onOpenChange}
      actions={[
        { id: "cancel", label: "Hủy", variant: "secondary" },
        {
          id: "confirm",
          label: "Xóa",
          variant: "danger",
          onClick: async () => {
            await onConfirm();
            onOpenChange(false);
          },
        },
      ]}
    />
  );
}
