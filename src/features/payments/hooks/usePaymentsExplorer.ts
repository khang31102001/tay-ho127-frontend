"use client";

import { useCallback, useState } from "react";
import type { PaymentStatus } from "@/features/orders";
import type { DataExplorerLoadPage } from "@/shared/admin/templates/DataExplorer/DataExplorer";

import { listPaymentsPage } from "../services/payment.service";
import type { ManagedPayment } from "../types/payment.types";

export type PaymentStatusFilter = PaymentStatus | "all";

/** Tải theo trang từ Backend (10 bản ghi/lượt); tìm kiếm và lọc trạng thái do Backend xử lý. */
export function usePaymentsExplorer() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");

  const loadPage = useCallback<DataExplorerLoadPage<ManagedPayment>>(
    async (query, signal) => {
      const page = await listPaymentsPage(
        { ...query, status: statusFilter === "all" ? undefined : statusFilter },
        signal,
      );
      return { items: page.items, totalItems: page.totalItems };
    },
    [statusFilter],
  );

  return { loadPage, statusFilter, setStatusFilter };
}
