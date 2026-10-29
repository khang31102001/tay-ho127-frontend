"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { StatusPopup } from "@/shared/components/StatusPopup";

import { adminButtonClassName } from "../formFieldClassName";

import { useDataEditor } from "./useDataEditor";

export type DataEditorProps = {
  title: string;
  backHref: string;
  /**
   * Field JSX do domain tự viết (composition) — DataEditor chỉ cung cấp chrome
   * (title, form, nút Lưu/Xóa, popup xác nhận/lỗi), không đoán shape field.
   */
  children: ReactNode;
  onSave: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onSaved?: () => void;
  onDeleted?: () => void;
  saveLabel?: string;
  isLoading?: boolean;
  /** Lỗi khi tải bản ghi cần sửa (vd. 404/403) — hiện thay cho form. */
  loadError?: string | null;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
};

/**
 * Template dùng chung cho mọi màn hình tạo/sửa/xóa (Editor) trong Admin Portal.
 */
export function DataEditor({
  title,
  backHref,
  children,
  onSave,
  onDelete,
  onSaved,
  onDeleted,
  saveLabel = "Lưu",
  isLoading = false,
  loadError = null,
  deleteConfirmTitle = "Xác nhận xóa?",
  deleteConfirmDescription = "Hành động này không thể hoàn tác.",
}: DataEditorProps) {
  const {
    isSaving,
    popup,
    setPopup,
    confirmDeleteOpen,
    deleteError,
    setDeleteError,
    requestDelete,
    closeDeletePopup,
    handleConfirmDelete,
    handleSubmit,
  } = useDataEditor({ onSave, onDelete, onSaved, onDeleted });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-admin-title font-bold text-admin-text">{title}</h1>

        <Link
          href={backHref}
          className="text-admin-sm font-semibold text-admin-primary transition-colors duration-admin hover:text-admin-primaryHover hover:underline"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-admin border border-admin-border bg-admin-surface p-6 text-center text-admin-textSecondary">
          Đang tải dữ liệu...
        </div>
      ) : loadError ? (
        <div role="alert" className="mt-4 rounded-admin border border-admin-danger/40 bg-admin-danger/10 p-6 text-center text-admin-base font-medium text-admin-dangerText">
          {loadError}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 rounded-admin border border-admin-border bg-admin-surface p-6"
        >
          {children}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border pt-5">
            {onDelete ? (
              <button
                type="button"
                onClick={requestDelete}
                className="text-admin-sm font-semibold text-admin-danger hover:underline"
              >
                Xóa
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={isSaving}
              className={`${adminButtonClassName.primary} px-6`}
            >
              {isSaving ? "Đang lưu..." : saveLabel}
            </button>
          </div>
        </form>
      )}

      <StatusPopup
        open={confirmDeleteOpen}
        status={deleteError ? "error" : "warning"}
        title={deleteError ? "Không thể xóa." : deleteConfirmTitle}
        description={deleteError ?? deleteConfirmDescription}
        onOpenChange={(open) => {
          if (!open) {
            closeDeletePopup();
          }
        }}
        actions={
          deleteError
            ? [{ id: "close", label: "Đóng", variant: "secondary" }]
            : [
                { id: "cancel", label: "Hủy", variant: "secondary" },
                {
                  id: "confirm",
                  label: "Xóa",
                  variant: "danger",
                  onClick: handleConfirmDelete,
                },
              ]
        }
        onActionError={(error) => {
          setDeleteError(error instanceof Error ? error.message : "Vui lòng thử lại.");
        }}
      />

      <StatusPopup
        open={popup.open}
        status={popup.status}
        title={popup.title}
        description={popup.description}
        onOpenChange={(open) => setPopup((previous) => ({ ...previous, open }))}
        actions={[{ id: "close", label: "Đóng", variant: "secondary" }]}
      />
    </div>
  );
}
