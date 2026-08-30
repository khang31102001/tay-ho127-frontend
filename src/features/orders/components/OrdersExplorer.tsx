"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";

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

const PAGE_SIZE = 10;

const SELECT_CLASS =
  "h-10 rounded-lg border border-brand-line px-3 text-[13px] font-bold text-brand-greenDark outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

const columns: DataExplorerColumn<ManagedOrder>[] = [
  { key: "orderCode", header: "Mã đơn" },
  { key: "customerName", header: "Khách hàng" },
  { key: "phone", header: "Số điện thoại" },
  {
    key: "totalAmount",
    header: "Tổng tiền",
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
  const { orders, isLoading, statusFilter, setStatusFilter, paymentFilter, setPaymentFilter, dateFilter, setDateFilter } =
    useOrdersExplorer();

  return (
    <DataExplorer<ManagedOrder>
      title="Quản lý đơn hàng"
      columns={columns}
      rows={orders}
      isLoading={isLoading}
      pageSize={PAGE_SIZE}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.orderCode} ${row.customerName} ${row.phone}`}
      searchPlaceholder="Tìm theo mã đơn, tên, SĐT..."
      editHref={(row) => `/admin/sales/orders/${row.id}`}
      emptyState="Chưa có đơn hàng nào."
      toolbarActions={
        <>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as OrderStatusFilter)}
            className={SELECT_CLASS}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value as PaymentStatusFilter)}
            className={SELECT_CLASS}
          >
            {PAYMENT_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value as OrderDateFilter)}
            className={SELECT_CLASS}
          >
            {DATE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      }
    />
  );
}
