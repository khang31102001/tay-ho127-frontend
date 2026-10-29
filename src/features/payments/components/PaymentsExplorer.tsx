"use client";

import { useState } from "react";

import {
  DataExplorer,
  DataExplorerFilterSelect,
  type DataExplorerColumn,
} from "@/shared/admin/templates/DataExplorer/DataExplorer";
import { MoneyDisplay } from "@/shared/components/MoneyDisplay";
import { PAYMENT_STATUS_OPTIONS, PaymentStatusBadge } from "@/features/orders";

import { usePaymentsExplorer, type PaymentStatusFilter } from "../hooks/usePaymentsExplorer";
import type { ManagedPayment } from "../types/payment.types";

const STATUS_FILTER_OPTIONS: { value: PaymentStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  ...PAYMENT_STATUS_OPTIONS,
];

const columns: DataExplorerColumn<ManagedPayment>[] = [
  { key: "orderCode", header: "Mã đơn" },
  { key: "paymentMethodLabel", header: "Phương thức" },
  {
    key: "amount",
    header: "Số tiền",
    align: "right",
    render: (row) => <MoneyDisplay value={row.amount} />,
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <PaymentStatusBadge status={row.status} />,
  },
  {
    key: "paidAt",
    header: "Thanh toán lúc",
    render: (row) => (row.paidAt ? new Date(row.paidAt).toLocaleString("vi-VN") : "—"),
  },
  {
    key: "createdAt",
    header: "Ngày tạo",
    render: (row) => new Date(row.createdAt).toLocaleString("vi-VN"),
  },
];

/**
 * Danh sách/chi tiết thuần túy — không có createHref (Payment sinh ra cùng
 * Order từ Checkout, Admin không tự tạo) và không có onDelete (không xóa
 * giao dịch thanh toán).
 */
export function PaymentsExplorer() {
  // Đọc query string 1 lần khi mount (không dùng useSearchParams của Next.js
  // để tránh phải bọc Suspense chỉ cho một deep-link đơn giản từ Order Detail).
  const [initialSearchTerm] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return new URLSearchParams(window.location.search).get("search") ?? undefined;
  });

  const { loadPage, statusFilter, setStatusFilter } = usePaymentsExplorer();

  return (
    <DataExplorer<ManagedPayment>
      title="Quản lý thanh toán"
      columns={columns}
      loadPage={loadPage}
      initialSearchTerm={initialSearchTerm}
      getRowId={(row) => row.id}
      searchPlaceholder="Tìm theo mã đơn, phương thức..."
      editHref={(row) => `/admin/sales/payments/${row.id}`}
      emptyState="Chưa có giao dịch thanh toán nào."
      totalLabel="giao dịch"
      filters={
        <DataExplorerFilterSelect
          ariaLabel="Lọc theo trạng thái thanh toán"
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS}
        />
      }
    />
  );
}
