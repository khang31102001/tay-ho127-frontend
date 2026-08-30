"use client";

import Link from "next/link";

import { StatusPopup } from "@/components/shared/StatusPopup";
import { StatusTimeline } from "@/components/shared/StatusTimeline";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { PaymentStatusBadge } from "@/features/orders";

import { usePaymentDetail } from "../hooks/usePaymentDetail";
import { PAYMENT_TRANSACTION_ACTION_OPTIONS } from "../types/payment-transaction.types";
import { PaymentActions } from "./PaymentActions";

type PaymentDetailProps = {
  paymentId: string;
};

const ACTION_LABEL = Object.fromEntries(
  PAYMENT_TRANSACTION_ACTION_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

/**
 * Custom composed page (không dùng DataEditor) — action-driven giống
 * OrderDetail, không phải form/save-driven.
 */
export function PaymentDetail({ paymentId }: PaymentDetailProps) {
  const { payment, transactions, isLoading, isUpdating, errorMessage, clearError, handleTransition } =
    usePaymentDetail(paymentId);

  if (isLoading) {
    return (
      <div>
        <BackLink />
        <div className="mt-4 rounded-lg border border-brand-line bg-white p-6 text-center text-brand-muted">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div>
        <BackLink />
        <div className="mt-4 rounded-lg border border-brand-line bg-white p-6 text-center text-brand-muted">
          Không tìm thấy giao dịch thanh toán.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-brand-greenDark">Thanh toán đơn {payment.orderCode}</h1>
          <p className="mt-1 text-[13px] text-brand-muted">
            Tạo lúc {new Date(payment.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <BackLink />
      </div>

      <div className="mt-3">
        <PaymentStatusBadge status={payment.status} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-brand-line bg-white p-6">
            <h2 className="text-[15px] font-black text-brand-greenDark">Thông tin giao dịch</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-[14px] sm:grid-cols-2">
              <div>
                <dt className="text-brand-muted">Đơn hàng</dt>
                <dd>
                  <Link
                    href={`/admin/sales/orders/${payment.orderId}`}
                    className="font-bold text-brand-greenDark hover:underline"
                  >
                    {payment.orderCode} →
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-brand-muted">Phương thức</dt>
                <dd className="font-bold">{payment.paymentMethodLabel}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Số tiền</dt>
                <dd className="font-bold">
                  <MoneyDisplay value={payment.amount} />
                </dd>
              </div>
              {payment.transactionId && (
                <div>
                  <dt className="text-brand-muted">Mã giao dịch</dt>
                  <dd className="font-bold">{payment.transactionId}</dd>
                </div>
              )}
              {payment.gateway && (
                <div>
                  <dt className="text-brand-muted">Cổng thanh toán</dt>
                  <dd className="font-bold">{payment.gateway}</dd>
                </div>
              )}
              {payment.gatewayReference && (
                <div className="sm:col-span-2">
                  <dt className="text-brand-muted">Ghi chú đối chiếu</dt>
                  <dd className="font-bold">{payment.gatewayReference}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-lg border border-brand-line bg-white p-6">
            <h2 className="text-[15px] font-black text-brand-greenDark">Lịch sử giao dịch (Audit log)</h2>
            <p className="mt-1 text-[12px] text-brand-muted">
              Chỉ đọc — mỗi lần đổi trạng thái tạo một bản ghi mới, không sửa/xóa bản ghi cũ.
            </p>
            <div className="mt-4">
              <StatusTimeline
                entries={transactions.map((transaction) => ({
                  label: `${ACTION_LABEL[transaction.action] ?? transaction.action} — ${
                    transaction.result === "success" ? "Thành công" : "Thất bại"
                  }`,
                  timestamp: transaction.createdAt,
                  changedBy: transaction.changedBy,
                  note: transaction.message,
                }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <PaymentActions status={payment.status} isUpdating={isUpdating} onTransition={handleTransition} />
        </div>
      </div>

      <StatusPopup
        open={errorMessage !== null}
        status="error"
        title="Không thể cập nhật"
        description={errorMessage ?? undefined}
        onOpenChange={(open) => {
          if (!open) clearError();
        }}
        actions={[{ id: "close", label: "Đóng", variant: "secondary" }]}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/sales/payments"
      className="text-[13px] font-bold text-brand-muted transition hover:text-brand-greenDark"
    >
      ← Quay lại danh sách
    </Link>
  );
}
