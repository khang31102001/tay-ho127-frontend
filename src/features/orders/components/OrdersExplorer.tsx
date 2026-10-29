"use client";

import {
  DataExplorer,
  DataExplorerFilterSelect,
  type DataExplorerColumn,
} from "@/shared/admin/templates/DataExplorer/DataExplorer";
import { MoneyDisplay } from "@/shared/components/MoneyDisplay";

import {
  useOrdersExplorer,
  type OrderDateFilter,
  type OrderStatusFilter,
  type PaymentStatusFilter,
} from "../hooks/useOrdersExplorer";
import { ORDER_STATUS_OPTIONS } from "../types/order-status";
import { PAYMENT_STATUS_OPTIONS } from "../types/payment-status";
import type { ManagedOrder } from "../types/order.types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

const STATUS_FILTER_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  ...ORDER_STATUS_OPTIONS,
];

const PAYMENT_FILTER_OPTIONS: { value: PaymentStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả thanh toán" },
  ...PAYMENT_STATUS_OPTIONS,
];

const DATE_FILTER_OPTIONS: { value: OrderDateFilter; label: string }[] = [
  { value: "all", label: "Mọi thời gian" },
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
];

const columns: DataExplorerColumn<ManagedOrder>[] = [
  { key: "orderCode", header: "Mã đơn" },
  { key: "customerName", header: "Khách hàng" },
  { key: "phone", header: "Số điện thoại" },
  {
    key: "totalAmount",
    header: "Tổng tiền",
    align: "right",
    render: (row) => <MoneyDisplay value={row.totalAmount} />,
  },
  {
    key: "orderStatus",
    header: "Trạng thái đơn",
    render: (row) => <OrderStatusBadge status={row.orderStatus} />,
  },
  {
    key: "paymentStatus",
    header: "Thanh toán",
    render: (row) => <PaymentStatusBadge status={row.paymentStatus} />,
  },
  {
    key: "createdAt",
    header: "Ngày đặt",
    render: (row) => new Date(row.createdAt).toLocaleString("vi-VN"),
  },
];

/**
 * Orders là danh sách/chi tiết thuần túy — không có createHref (đơn được
 * tạo từ Checkout, không phải Admin tự tạo) và không có onDelete (không
 * xóa đơn đã phát sinh giao dịch).
 */
export function OrdersExplorer() {
  const { loadPage, statusFilter, setStatusFilter, paymentFilter, setPaymentFilter, dateFilter, setDateFilter } =
    useOrdersExplorer();

  return (
    <DataExplorer<ManagedOrder>
      title="Quản lý đơn hàng"
      columns={columns}
      loadPage={loadPage}
      getRowId={(row) => row.id}
      searchPlaceholder="Tìm theo mã đơn, tên, SĐT..."
      editHref={(row) => `/admin/sales/orders/${row.id}`}
      emptyState="Chưa có đơn hàng nào."
      totalLabel="đơn"
      filters={
        <>
          <DataExplorerFilterSelect
            ariaLabel="Lọc theo trạng thái đơn"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
          />
          <DataExplorerFilterSelect
            ariaLabel="Lọc theo trạng thái thanh toán"
            value={paymentFilter}
            onChange={setPaymentFilter}
            options={PAYMENT_FILTER_OPTIONS}
          />
          <DataExplorerFilterSelect
            ariaLabel="Lọc theo ngày đặt"
            value={dateFilter}
            onChange={setDateFilter}
            options={DATE_FILTER_OPTIONS}
          />
        </>
      }
    />
  );
}
