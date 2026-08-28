"use client";

import { useState, type FormEvent } from "react";

import type { PopupStatus } from "@/components/shared/StatusPopup";

type PopupState = {
  open: boolean;
  status: PopupStatus;
  title: string;
  description: string;
};

type UseDataEditorParams = {
  onSave: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  /**
   * Gọi sau khi lưu thành công (ví dụ: điều hướng về Explore).
   */
  onSaved?: () => void;
  /**
   * Gọi sau khi xóa thành công (ví dụ: điều hướng về Explore).
   */
  onDeleted?: () => void;
};

export function useDataEditor({ onSave, onDelete, onSaved, onDeleted }: UseDataEditorParams) {
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [popup, setPopup] = useState<PopupState>({
    open: false,
    status: "success",
    title: "",
    description: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      await onSave();
      onSaved?.();
    } catch (error) {
      setPopup({
        open: true,
        status: "error",
        title: "Không thể lưu.",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function requestDelete() {
    setDeleteError(null);
    setConfirmDeleteOpen(true);
  }

  function closeDeletePopup() {
    setConfirmDeleteOpen(false);
    setDeleteError(null);
  }

  async function handleConfirmDelete() {
    await onDelete?.();
    onDeleted?.();
  }

  return {
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
  };
}
