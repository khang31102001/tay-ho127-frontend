"use client";

import { useState } from "react";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { PAYMENT_STATUS_OPTIONS, PaymentStatusBadge } from "@/features/orders";

import { usePaymentsExplorer, type PaymentStatusFilter } from "../hooks/usePaymentsExplorer";
import type { ManagedPayment } from "../types/payment.types";

const STATUS_FILTER_OPTIONS: { value: PaymentStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  ...PAYMENT_STATUS_OPTIONS,
];

const PAGE_SIZE = 10;

const columns: DataExplorerColumn<ManagedPayment>[] = [
  { key: "orderCode", header: "Mã đơn" },
  { key: "paymentMethodLabel", header: "Phương thức" },
  {
    key: "amount",
    header: "Số tiền",
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

  const { payments, isLoading, statusFilter, setStatusFilter } = usePaymentsExplorer();

  return (
    <DataExplorer<ManagedPayment>
      title="Quản lý thanh toán"
      columns={columns}
      rows={payments}
      isLoading={isLoading}
      pageSize={PAGE_SIZE}
      initialSearchTerm={initialSearchTerm}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.orderCode} ${row.paymentMethodLabel} ${row.transactionId ?? ""}`}
      searchPlaceholder="Tìm theo mã đơn, phương thức..."
      editHref={(row) => `/admin/sales/payments/${row.id}`}
      emptyState="Chưa có giao dịch thanh toán nào."
      toolbarActions={
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as PaymentStatusFilter)}
          className="h-10 rounded-lg border border-brand-line px-3 text-[13px] font-bold text-brand-greenDark outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      }
    />
  );
}
