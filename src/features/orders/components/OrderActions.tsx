"use client";

import { ORDER_STATUS_LABEL, ORDER_STATUS_TRANSITIONS, type OrderStatus } from "../types/order-status";

type OrderActionsProps = {
  orderStatus: OrderStatus;
  isUpdating: boolean;
  onTransition: (toStatus: OrderStatus) => void;
};

/**
 * Chỉ render nút cho các bước chuyển hợp lệ theo ORDER_STATUS_TRANSITIONS —
 * ví dụ đơn COMPLETED/CANCELLED (terminal state) sẽ không có nút nào.
 * Trạng thái thanh toán KHÔNG sửa ở đây nữa — chuyển sang màn Payment Detail
 * (features/payments), nơi mỗi lần đổi trạng thái đều ghi PaymentTransaction
 * audit log, thay vì một dropdown tự do không có lịch sử.
 */
export function OrderActions({ orderStatus, isUpdating, onTransition }: OrderActionsProps) {
  const nextStatuses = ORDER_STATUS_TRANSITIONS[orderStatus];

  return (
    <div className="rounded-lg border border-brand-line bg-white p-6">
      <h2 className="text-[15px] font-black text-brand-greenDark">Thao tác</h2>

      {nextStatuses.length === 0 ? (
        <p className="mt-3 text-[13px] text-brand-muted">Đơn hàng đã ở trạng thái cuối, không thể chuyển tiếp.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {nextStatuses.map((status) => (
            <button
              key={status}
              type="button"
              disabled={isUpdating}
              onClick={() => onTransition(status)}
              className={
                status === "cancelled"
                  ? "rounded-lg border border-red-200 px-4 py-2 text-[13px] font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  : "rounded-lg bg-brand-red px-4 py-2 text-[13px] font-bold text-white transition hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-60"
              }
            >
              {status === "cancelled" ? "Hủy đơn" : `Chuyển sang "${ORDER_STATUS_LABEL[status]}"`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
