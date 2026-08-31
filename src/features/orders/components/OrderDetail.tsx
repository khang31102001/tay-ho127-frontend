"use client";

import Link from "next/link";

import { StatusPopup } from "@/components/shared/StatusPopup";
import { StatusTimeline } from "@/components/shared/StatusTimeline";

import { useOrderDetail } from "../hooks/useOrderDetail";
import { ORDER_STATUS_LABEL } from "../types/order-status";
import { OrderActions } from "./OrderActions";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderSummary } from "./OrderSummary";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

type OrderDetailProps = {
  orderId: string;
};

/**
 * Custom composed page (không dùng DataEditor) vì màn này là action-driven
 * (chuyển trạng thái) chứ không phải form/save-driven như các Editor khác.
 */
export function OrderDetail({ orderId }: OrderDetailProps) {
  const { order, isLoading, isUpdating, errorMessage, clearError, handleTransition } = useOrderDetail(orderId);

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

  if (!order) {
    return (
      <div>
        <BackLink />
        <div className="mt-4 rounded-lg border border-brand-line bg-white p-6 text-center text-brand-muted">
          Không tìm thấy đơn hàng.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-brand-greenDark">Đơn hàng {order.orderCode}</h1>
          <p className="mt-1 text-[13px] text-brand-muted">
            Đặt lúc {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <BackLink />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <OrderStatusBadge status={order.orderStatus} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-brand-line bg-white p-6">
            <h2 className="text-[15px] font-black text-brand-greenDark">Thông tin khách hàng</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-[14px] sm:grid-cols-2">
              <div>
                <dt className="text-brand-muted">Họ tên</dt>
                <dd className="font-bold">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Số điện thoại</dt>
                <dd className="font-bold">{order.phone}</dd>
              </div>
              {order.email && (
                <div>
                  <dt className="text-brand-muted">Email</dt>
                  <dd className="font-bold">{order.email}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-brand-muted">Địa chỉ giao hàng</dt>
                <dd className="font-bold">{order.deliveryAddressSnapshot}</dd>
              </div>
              {order.customerId ? (
                <div>
                  <dt className="text-brand-muted">Khách hàng</dt>
                  <dd>
                    <Link
                      href={`/admin/sales/customers/${order.customerId}`}
                      className="font-bold text-brand-greenDark hover:underline"
                    >
                      Xem hồ sơ khách hàng →
                    </Link>
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="text-brand-muted">Khách hàng</dt>
                  <dd className="font-bold text-brand-muted">Khách vãng lai (Guest Checkout)</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h2 className="mb-2 text-[15px] font-black text-brand-greenDark">Sản phẩm</h2>
            <OrderItemsTable items={order.items} />
          </div>

          <div className="rounded-lg border border-brand-line bg-white p-6">
            <h2 className="text-[15px] font-black text-brand-greenDark">Thanh toán &amp; Vận chuyển</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-[14px] sm:grid-cols-2">
              <div>
                <dt className="text-brand-muted">Phương thức thanh toán</dt>
                <dd className="font-bold">{order.paymentMethodLabel}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Phương thức giao hàng</dt>
                <dd className="font-bold">{order.deliveryMethodLabel}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Dụng cụ ăn uống</dt>
                <dd className="font-bold">{order.wantsUtensils ? "Có" : "Không"}</dd>
              </div>
            </dl>
            {order.note && (
              <p className="mt-3 rounded-lg bg-brand-cream/40 p-3 text-[13px] text-brand-muted">
                Ghi chú: {order.note}
              </p>
            )}
            <Link
              href={`/admin/sales/payments?search=${order.orderCode}`}
              className="mt-3 inline-block text-[13px] font-bold text-brand-greenDark hover:underline"
            >
              Xem chi tiết thanh toán →
            </Link>
          </div>

          <div className="rounded-lg border border-brand-line bg-white p-6">
            <h2 className="text-[15px] font-black text-brand-greenDark">Lịch sử trạng thái</h2>
            <div className="mt-4">
              <StatusTimeline
                entries={order.statusHistory.map((entry) => ({
                  label: `${entry.fromStatus ? `${ORDER_STATUS_LABEL[entry.fromStatus]} → ` : ""}${ORDER_STATUS_LABEL[entry.toStatus]}`,
                  timestamp: entry.changedAt,
                  changedBy: entry.changedBy,
                  note: entry.note,
                }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <OrderSummary order={order} />
          <OrderActions orderStatus={order.orderStatus} isUpdating={isUpdating} onTransition={handleTransition} />
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
      href="/admin/sales/orders"
      className="text-[13px] font-bold text-brand-muted transition hover:text-brand-greenDark"
    >
      ← Quay lại danh sách
    </Link>
  );
}
