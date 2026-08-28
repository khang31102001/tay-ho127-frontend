import { LoaderCircle } from "lucide-react";

export interface LoadingOverlayProps {
  /**
   * Nội dung hiển thị dưới spinner.
   */
  message?: string;

  /**
   * Class mở rộng cho lớp nền overlay.
   */
  className?: string;
}

const DEFAULT_MESSAGE = "Đang tải dữ liệu, vui lòng chờ...";

/**
 * Overlay full-screen dùng chung: khóa toàn bộ UI phía dưới (không thể click
 * xuyên qua vì overlay phủ kín viewport ở z-index cao nhất) và báo trạng thái
 * loading cho assistive technology qua aria-busy/aria-live.
 *
 * Component thuần hiển thị, không tự quản lý việc hiện/ẩn — nơi gọi (Provider,
 * `loading.tsx`, hoặc component bất kỳ) chịu trách nhiệm mount/unmount nó.
 */
export function LoadingOverlay({
  message = DEFAULT_MESSAGE,
  className,
}: LoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={[
        "fixed inset-0 z-[10050] flex items-center justify-center",
        "bg-brand-ink/40 backdrop-blur-[2px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="
          flex flex-col items-center gap-3
          rounded-2xl border border-brand-line
          bg-white px-8 py-7
          shadow-2xl shadow-black/20
        "
      >
        <LoaderCircle
          className="size-9 animate-spin text-brand-green"
          aria-hidden="true"
        />

        <p className="text-center text-[14px] font-bold text-brand-ink">
          {message}
        </p>
      </div>
    </div>
  );
}
