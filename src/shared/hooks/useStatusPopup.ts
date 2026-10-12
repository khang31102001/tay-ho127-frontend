"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

export type PopupActionVariant =
  | "primary"
  | "secondary"
  | "danger";

export interface StatusPopupAction {
  /**
   * Khóa định danh của action.
   * Nên truyền khi danh sách action có thể thay đổi.
   */
  id?: string;

  /**
   * Nội dung hiển thị trên nút.
   */
  label: string;

  /**
   * Hàm xử lý khi nhấn nút.
   * Hỗ trợ cả hàm đồng bộ và Promise.
   */
  onClick?: () => void | Promise<void>;

  /**
   * Kiểu hiển thị nút.
   */
  variant?: PopupActionVariant;

  /**
   * Icon đặt trước nội dung nút.
   */
  icon?: ReactNode;

  /**
   * Vô hiệu hóa action.
   */
  disabled?: boolean;

  /**
   * Trạng thái loading do component cha kiểm soát.
   */
  loading?: boolean;

  /**
   * Có đóng popup sau khi action thành công hay không.
   * Mặc định: true.
   */
  closeAfterClick?: boolean;
}

const FOCUSABLE_ELEMENT_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type UseStatusPopupBehaviorParams = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoCloseMs: number;
  closeOnEscape: boolean;
  lockCloseWhilePending: boolean;
  onActionError?: (
    error: unknown,
    action: StatusPopupAction,
  ) => void;
};

export function useStatusPopupBehavior({
  open,
  onOpenChange,
  autoCloseMs,
  closeOnEscape,
  lockCloseWhilePending,
  onActionError,
}: UseStatusPopupBehaviorParams) {
  const [mounted, setMounted] = useState(false);
  const [pendingActionIndex, setPendingActionIndex] =
    useState<number | null>(null);

  const dialogRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const isActionPending = pendingActionIndex !== null;

  function requestClose(force = false) {
    if (
      !force &&
      lockCloseWhilePending &&
      isActionPending
    ) {
      return;
    }

    onOpenChange(false);
  }

  async function handleAction(
    action: StatusPopupAction,
    actionIndex: number,
  ) {
    if (
      action.disabled ||
      action.loading ||
      isActionPending
    ) {
      return;
    }

    try {
      setPendingActionIndex(actionIndex);

      await action.onClick?.();

      if (action.closeAfterClick !== false) {
        requestClose(true);
      }
    } catch (error) {
      onActionError?.(error, action);

      if (!onActionError) {
        console.error(
          `StatusPopup action "${action.label}" failed:`,
          error,
        );
      }
    } finally {
      setPendingActionIndex(null);
    }
  }

  function handleDialogKeyDown(
    event: ReactKeyboardEvent<HTMLElement>,
  ) {
    if (event.key !== "Tab") {
      return;
    }

    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        FOCUSABLE_ELEMENT_SELECTOR,
      ),
    ).filter(
      (element) =>
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true",
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement =
      focusableElements[focusableElements.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === firstElement
    ) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Khóa scroll trang và quản lý focus khi popup mở.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousBodyOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const animationFrame = requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(animationFrame);

      document.body.style.overflow =
        previousBodyOverflow;

      previouslyFocusedElement?.focus();
    };
  }, [open]);

  /**
   * Đóng popup bằng phím Escape.
   */
  useEffect(() => {
    if (!open || !closeOnEscape) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (
        lockCloseWhilePending &&
        pendingActionIndex !== null
      ) {
        return;
      }

      onOpenChange(false);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    closeOnEscape,
    lockCloseWhilePending,
    pendingActionIndex,
    onOpenChange,
  ]);

  /**
   * Tự động đóng popup.
   */
  useEffect(() => {
    if (
      !open ||
      autoCloseMs <= 0 ||
      pendingActionIndex !== null
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onOpenChange(false);
    }, autoCloseMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    open,
    autoCloseMs,
    pendingActionIndex,
    onOpenChange,
  ]);

  return {
    mounted,
    dialogRef,
    titleId,
    descriptionId,
    isActionPending,
    pendingActionIndex,
    requestClose,
    handleAction,
    handleDialogKeyDown,
  };
}
