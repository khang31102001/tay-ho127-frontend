"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { StatusPopup } from "@/components/shared/StatusPopup";

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
        <h1 className="text-[20px] font-black text-brand-greenDark">{title}</h1>

        <Link
          href={backHref}
          className="text-[13px] font-bold text-brand-muted transition hover:text-brand-greenDark"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-lg border border-brand-line bg-white p-6 text-center text-brand-muted">
          Đang tải dữ liệu...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 rounded-lg border border-brand-line bg-white p-6"
        >
          {children}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-5">
            {onDelete ? (
              <button
                type="button"
                onClick={requestDelete}
                className="text-[13px] font-bold text-red-600 hover:underline"
              >
                Xóa
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-brand-red px-6 py-2.5 text-[14px] font-black text-white transition hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-60"
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
