"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Info,
  LoaderCircle,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type PopupStatus =
  | "success"
  | "failed"
  | "warning"
  | "error"
  | "info";

export type PopupSize = "sm" | "md" | "lg";

export type PopupPlacement = "center" | "top";

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

export interface StatusPopupProps {
  /**
   * Điều khiển trạng thái hiển thị.
   */
  open: boolean;

  /**
   * Callback khi popup cần đóng hoặc mở.
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Loại thông báo.
   */
  status?: PopupStatus;

  /**
   * Tiêu đề popup.
   */
  title: ReactNode;

  /**
   * Nội dung mô tả ngắn.
   */
  description?: ReactNode;

  /**
   * Nội dung tùy chỉnh mở rộng.
   */
  children?: ReactNode;

  /**
   * Ghi đè icon mặc định.
   */
  icon?: ReactNode;

  /**
   * Danh sách nút hành động.
   */
  actions?: StatusPopupAction[];

  /**
   * Footer tùy chỉnh.
   * Khi truyền footer, danh sách actions sẽ không được hiển thị.
   */
  footer?: ReactNode;

  /**
   * Kích thước popup.
   */
  size?: PopupSize;

  /**
   * Vị trí popup.
   */
  placement?: PopupPlacement;

  /**
   * Hiển thị nút X.
   */
  showCloseButton?: boolean;

  /**
   * Cho phép đóng khi click nền tối.
   */
  closeOnBackdrop?: boolean;

  /**
   * Cho phép đóng bằng phím Escape.
   */
  closeOnEscape?: boolean;

  /**
   * Tự động đóng sau số millisecond.
   * Không truyền hoặc truyền 0 để tắt.
   */
  autoCloseMs?: number;

  /**
   * Không cho đóng popup khi một action đang xử lý.
   */
  lockCloseWhilePending?: boolean;

  /**
   * Xử lý lỗi phát sinh trong action.
   */
  onActionError?: (
    error: unknown,
    action: StatusPopupAction,
  ) => void;

  /**
   * Class mở rộng cho popup.
   */
  className?: string;

  /**
   * Class mở rộng cho lớp backdrop.
   */
  overlayClassName?: string;

  /**
   * Class mở rộng cho vùng footer.
   */
  footerClassName?: string;
}

interface StatusConfig {
  icon: LucideIcon;
  iconContainerClassName: string;
  iconClassName: string;
  accentClassName: string;
  primaryButtonClassName: string;
}

const STATUS_CONFIG: Record<PopupStatus, StatusConfig> = {
  success: {
    icon: CheckCircle2,
    iconContainerClassName:
      "bg-emerald-50 ring-emerald-100",
    iconClassName: "text-emerald-600",
    accentClassName: "bg-emerald-500",
    primaryButtonClassName:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  },

  failed: {
    icon: XCircle,
    iconContainerClassName:
      "bg-rose-50 ring-rose-100",
    iconClassName: "text-rose-600",
    accentClassName: "bg-rose-500",
    primaryButtonClassName:
      "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500",
  },

  warning: {
    icon: AlertTriangle,
    iconContainerClassName:
      "bg-amber-50 ring-amber-100",
    iconClassName: "text-amber-600",
    accentClassName: "bg-amber-500",
    primaryButtonClassName:
      "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500",
  },

  error: {
    icon: CircleAlert,
    iconContainerClassName:
      "bg-red-50 ring-red-100",
    iconClassName: "text-red-600",
    accentClassName: "bg-red-600",
    primaryButtonClassName:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  },

  info: {
    icon: Info,
    iconContainerClassName:
      "bg-sky-50 ring-sky-100",
    iconClassName: "text-sky-600",
    accentClassName: "bg-sky-500",
    primaryButtonClassName:
      "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-500",
  },
};

const SIZE_CLASSES: Record<PopupSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

const PLACEMENT_CLASSES: Record<PopupPlacement, string> = {
  center: "items-center",
  top: "items-start pt-[10vh]",
};

const FOCUSABLE_ELEMENT_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

function getActionButtonClassName(
  variant: PopupActionVariant,
  primaryButtonClassName: string,
): string {
  const commonClassName = cn(
    "inline-flex min-h-10 items-center justify-center gap-2",
    "rounded-lg px-4 py-2 text-sm font-semibold",
    "transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  );

  switch (variant) {
    case "danger":
      return cn(
        commonClassName,
        "bg-red-600 text-white hover:bg-red-700",
        "focus-visible:ring-red-500",
      );

    case "secondary":
      return cn(
        commonClassName,
        "border border-slate-200 bg-white text-slate-700",
        "hover:bg-slate-50",
        "focus-visible:ring-slate-400",
      );

    case "primary":
    default:
      return cn(commonClassName, primaryButtonClassName);
  }
}

export function StatusPopup({
  open,
  onOpenChange,
  status = "info",
  title,
  description,
  children,
  icon,
  actions = [],
  footer,
  size = "md",
  placement = "center",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  autoCloseMs = 0,
  lockCloseWhilePending = true,
  onActionError,
  className,
  overlayClassName,
  footerClassName,
}: StatusPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [pendingActionIndex, setPendingActionIndex] =
    useState<number | null>(null);

  const dialogRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const shouldReduceMotion = useReducedMotion();

  const config = STATUS_CONFIG[status];
  const DefaultIcon = config.icon;

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

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="status-popup-overlay"
          className={cn(
            "fixed inset-0 z-[9999] flex justify-center",
            "overflow-y-auto bg-slate-950/55",
            "px-4 py-6 backdrop-blur-[2px]",
            PLACEMENT_CLASSES[placement],
            overlayClassName,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.1 : 0.2,
          }}
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              closeOnBackdrop
            ) {
              requestClose();
            }
          }}
        >
          <motion.section
            ref={dialogRef}
            tabIndex={-1}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={
              description ? descriptionId : undefined
            }
            aria-busy={isActionPending}
            className={cn(
              "relative w-full overflow-hidden",
              "rounded-2xl border border-slate-200",
              "bg-white shadow-2xl shadow-slate-950/20",
              "outline-none",
              SIZE_CLASSES[size],
              className,
            )}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.96,
                    y: 20,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.97,
                    y: 12,
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.1 }
                : {
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }
            }
            onKeyDown={handleDialogKeyDown}
          >
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-1",
                config.accentClassName,
              )}
            />

            {showCloseButton && (
              <button
                type="button"
                aria-label="Đóng thông báo"
                disabled={
                  lockCloseWhilePending &&
                  isActionPending
                }
                className={cn(
                  "absolute right-4 top-4 z-10",
                  "inline-flex size-9 items-center",
                  "justify-center rounded-full",
                  "text-slate-400 transition-colors",
                  "hover:bg-slate-100 hover:text-slate-700",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-slate-400",
                  "disabled:cursor-not-allowed",
                  "disabled:opacity-40",
                )}
                onClick={() => requestClose()}
              >
                <X className="size-5" />
              </button>
            )}

            <div className="px-6 pb-5 pt-7 sm:px-7">
              <div className="flex gap-4">
                <motion.div
                  className={cn(
                    "flex size-12 shrink-0",
                    "items-center justify-center",
                    "rounded-full ring-8",
                    config.iconContainerClassName,
                  )}
                  initial={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 0.75,
                          rotate: -8,
                        }
                  }
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    delay: shouldReduceMotion
                      ? 0
                      : 0.08,
                    type: "spring",
                    stiffness: 420,
                    damping: 24,
                  }}
                >
                  {icon ?? (
                    <DefaultIcon
                      className={cn(
                        "size-6",
                        config.iconClassName,
                      )}
                      strokeWidth={2.2}
                    />
                  )}
                </motion.div>

                <div className="min-w-0 flex-1 pr-6">
                  <h2
                    id={titleId}
                    className={cn(
                      "text-lg font-semibold",
                      "leading-7 text-slate-900",
                    )}
                  >
                    {title}
                  </h2>

                  {description && (
                    <div
                      id={descriptionId}
                      className={cn(
                        "mt-1.5 text-sm leading-6",
                        "text-slate-600",
                      )}
                    >
                      {description}
                    </div>
                  )}
                </div>
              </div>

              {children && (
                <div
                  className={cn(
                    "mt-5 rounded-xl",
                    "border border-slate-200",
                    "bg-slate-50 p-4",
                    "text-sm text-slate-700",
                  )}
                >
                  {children}
                </div>
              )}
            </div>

            {footer ? (
              <div
                className={cn(
                  "border-t border-slate-200",
                  "bg-slate-50 px-6 py-4",
                  footerClassName,
                )}
              >
                {footer}
              </div>
            ) : actions.length > 0 ? (
              <div
                className={cn(
                  "flex flex-col-reverse gap-3",
                  "border-t border-slate-200",
                  "bg-slate-50 px-6 py-4",
                  "sm:flex-row sm:justify-end",
                  footerClassName,
                )}
              >
                {actions.map((action, index) => {
                  const isLoading =
                    action.loading ||
                    pendingActionIndex === index;

                  const variant =
                    action.variant ?? "primary";

                  return (
                    <button
                      key={
                        action.id ??
                        `${action.label}-${index}`
                      }
                      type="button"
                      disabled={
                        action.disabled ||
                        action.loading ||
                        isActionPending
                      }
                      className={getActionButtonClassName(
                        variant,
                        config.primaryButtonClassName,
                      )}
                      onClick={() =>
                        handleAction(action, index)
                      }
                    >
                      {isLoading ? (
                        <LoaderCircle
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        action.icon
                      )}

                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}