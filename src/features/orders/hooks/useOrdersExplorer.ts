"use client";

import { useCallback, useState } from "react";

import type { DataExplorerLoadPage } from "@/shared/admin/templates/DataExplorer/DataExplorer";

import { listOrdersPage } from "../services/order.service";
import type { OrderStatus } from "../types/order-status";
import type { PaymentStatus } from "../types/payment-status";
import type { ManagedOrder } from "../types/order.types";

export type OrderStatusFilter = OrderStatus | "all";
export type PaymentStatusFilter = PaymentStatus | "all";
export type OrderDateFilter = "all" | "today" | "7d" | "30d";

const DATE_FILTER_DAYS: Record<Exclude<OrderDateFilter, "all">, number> = {
  today: 1,
  "7d": 7,
  "30d": 30,
};

function dateFilterThreshold(filter: OrderDateFilter): number | null {
  if (filter === "all") return null;
  return Date.now() - DATE_FILTER_DAYS[filter] * 24 * 60 * 60 * 1000;
}

/**
 * Danh sách đơn tải theo trang từ Backend (10 đơn/lượt): tìm kiếm + lọc trạng thái đơn/thanh toán chạy ở Backend.
 * Backend chưa lọc được theo ngày, nhưng trả đơn MỚI NHẤT TRƯỚC — nên lọc ngày ở đây: bỏ đơn cũ hơn mốc và dừng
 * tải thêm ngay khi gặp đơn cũ hơn mốc (mọi trang sau đều cũ hơn). Khi lọc ngày, tổng số không biết trước.
 */
export function useOrdersExplorer() {
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<OrderDateFilter>("all");

  const loadPage = useCallback<DataExplorerLoadPage<ManagedOrder>>(
    async (query, signal) => {
      const page = await listOrdersPage(
        {
          ...query,
          status: statusFilter === "all" ? undefined : statusFilter,
          paymentStatus: paymentFilter === "all" ? undefined : paymentFilter,
        },
        signal,
      );

      const threshold = dateFilterThreshold(dateFilter);
      if (threshold === null) return { items: page.items, totalItems: page.totalItems };

      const items = page.items.filter((order) => new Date(order.createdAt).getTime() >= threshold);
      const hasReachedOlderOrders = items.length < page.items.length;
      return {
        items,
        hasMore: !hasReachedOlderOrders && query.page * query.pageSize < page.totalItems,
      };
    },
    [statusFilter, paymentFilter, dateFilter],
  );

  return {
    loadPage,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    dateFilter,
    setDateFilter,
  };
}
