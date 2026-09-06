import type { PaymentSession } from "../types/payment.types";

type PaymentStatusPanelProps = {
  session: PaymentSession;
  isProcessing: boolean;
  actionError: string | undefined;
  onConfirm: () => void;
  onReportFailure: () => void;
  onRetry: () => void;
};

/** Khu vực trạng thái + hành động của Payment Page — nội dung phụ thuộc PaymentSession.status (pending/processing/failed/success). */
export function PaymentStatusPanel({
  session,
  isProcessing,
  actionError,
  onConfirm,
  onReportFailure,
  onRetry,
}: PaymentStatusPanelProps) {
  const isBankTransfer = session.paymentMethod === "QR";

  return (
    <section className="rounded-lg bg-white p-7 text-center shadow-soft">
      {session.status === "pending" && (
        <>
          <p className="text-[14px] font-bold text-orange-600">⏳ Đang chờ thanh toán...</p>
          <p className="mt-1 text-[12px] text-[#4b4b4b]">
            {isBankTransfer
              ? "Sau khi chuyển khoản thành công, bấm nút bên dưới để chúng tôi xác nhận đơn hàng của bạn."
              : `Sau khi hoàn tất thanh toán trên ${session.paymentMethodLabel}, bấm nút bên dưới để chúng tôi xác nhận đơn hàng của bạn.`}
          </p>

          {actionError && <p className="mt-3 text-[12px] font-bold text-red-500">{actionError}</p>}

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="mt-4 w-full rounded-md bg-brand-red px-8 py-3 text-[14px] font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing
              ? "Đang xác nhận..."
              : isBankTransfer
                ? "Tôi đã chuyển khoản"
                : `Tiếp tục với ${session.paymentMethodLabel}`}
          </button>

          <button
            type="button"
            onClick={onReportFailure}
            disabled={isProcessing}
            className="mt-3 text-[12px] font-bold text-[#9a9a9a] underline transition hover:text-red-500 disabled:cursor-not-allowed"
          >
            Gặp sự cố, báo thanh toán thất bại
          </button>
        </>
      )}

      {session.status === "processing" && (
        <p className="text-[14px] font-bold text-orange-600">⏳ Đang xử lý xác nhận thanh toán...</p>
      )}

      {session.status === "failed" && (
        <>
          <p className="text-[14px] font-black text-red-600">Thanh toán thất bại</p>
          <p className="mt-1 text-[12px] text-[#4b4b4b]">
            Giao dịch chưa được xác nhận. Bạn có thể thử lại nếu đã thanh toán thành công.
          </p>

          <button
            type="button"
            onClick={onRetry}
            disabled={isProcessing}
            className="mt-4 rounded-md bg-brand-red px-8 py-3 text-[14px] font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Đang xử lý..." : "Thử lại"}
          </button>
        </>
      )}

      {session.status === "success" && (
        <p className="text-[14px] font-black text-brand-green">Thanh toán thành công! Đang chuyển hướng...</p>
      )}
    </section>
  );
}
