import type { PaymentSession } from "../types/payment.types";

type PaymentStatusPanelProps = {
  session: PaymentSession;
  isProcessing: boolean;
  actionError: string | undefined;
  onRetry: () => void;
};

/**
 * Khu vực trạng thái + hành động của Payment Page — nội dung phụ thuộc PaymentSession.status. Khách KHÔNG tự xác nhận đã
 * thanh toán: nhân viên đối chiếu số tiền nhận được rồi xác nhận ở Admin, trang này tự cập nhật.
 */
export function PaymentStatusPanel({ session, isProcessing, actionError, onRetry }: PaymentStatusPanelProps) {
  const isBankTransfer = session.paymentMethod === "QR";

  return (
    <section className="rounded-lg bg-white p-7 text-center shadow-soft">
      {session.status === "pending" && (
        <>
          <p className="text-[14px] font-bold text-orange-600">⏳ Đang chờ xác nhận thanh toán...</p>
          <p className="mt-1 text-[12px] text-[#4b4b4b]">
            {isBankTransfer
              ? "Vui lòng chuyển khoản đúng số tiền và ghi mã tham chiếu vào nội dung. Cửa hàng sẽ xác nhận ngay khi nhận được tiền — trang này sẽ tự cập nhật, bạn không cần làm gì thêm."
              : `Vui lòng hoàn tất thanh toán trên ${session.paymentMethodLabel}. Cửa hàng sẽ xác nhận ngay khi nhận được tiền — trang này sẽ tự cập nhật.`}
          </p>
          <p className="mt-2 text-[12px] text-[#7a7a7a]">
            Phiên giữ chỗ hết hạn lúc {new Date(session.expiresAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.
          </p>
        </>
      )}

      {session.status === "failed" && (
        <>
          <p className="text-[14px] font-black text-red-600">Chưa xác nhận được thanh toán</p>
          <p className="mt-1 text-[12px] text-[#4b4b4b]">
            {session.resolutionNote ?? "Cửa hàng chưa nhận được tiền cho giao dịch này."} Nếu bạn đã chuyển khoản, bấm
            &quot;Thử lại&quot; để cửa hàng kiểm tra lại.
          </p>

          {actionError && <p className="mt-3 text-[12px] font-bold text-red-500">{actionError}</p>}

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
