"use client";

import { PAYMENT_STATUS_LABEL, type PaymentStatus } from "@/features/orders";

import { PAYMENT_TRANSITIONS } from "../types/payment-transitions";

type PaymentActionsProps = {
  status: PaymentStatus;
  isUpdating: boolean;
  onTransition: (toStatus: PaymentStatus) => void;
};

const BUTTON_LABEL: Partial<Record<PaymentStatus, string>> = {
  paid: "Xác nhận đã thanh toán",
  failed: "Đánh dấu thất bại",
  refunded: "Hoàn tiền",
  cancelled: "Hủy giao dịch",
  pending: "Thử lại giao dịch",
};

/**
 * Chỉ render nút cho bước chuyển hợp lệ theo PAYMENT_TRANSITIONS — refunded
 * và cancelled là terminal state, không có nút tiếp theo. Không có thao tác
 * "sửa" trực tiếp field của Payment đã paid — mọi thay đổi đều phải qua một
 * transition được ghi audit log (PaymentTransaction).
 */
export function PaymentActions({ status, isUpdating, onTransition }: PaymentActionsProps) {
  const nextStatuses = PAYMENT_TRANSITIONS[status];

  return (
    <div className="rounded-lg border border-brand-line bg-white p-6">
      <h2 className="text-[15px] font-black text-brand-greenDark">Thao tác</h2>

      {nextStatuses.length === 0 ? (
        <p className="mt-3 text-[13px] text-brand-muted">Giao dịch đã ở trạng thái cuối, không thể chuyển tiếp.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {nextStatuses.map((next) => (
            <button
              key={next}
              type="button"
              disabled={isUpdating}
              onClick={() => onTransition(next)}
              className={
                next === "failed" || next === "cancelled"
                  ? "rounded-lg border border-red-200 px-4 py-2 text-[13px] font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  : "rounded-lg bg-brand-red px-4 py-2 text-[13px] font-bold text-white transition hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-60"
              }
            >
              {BUTTON_LABEL[next] ?? PAYMENT_STATUS_LABEL[next]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
