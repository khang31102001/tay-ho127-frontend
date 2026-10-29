"use client";

import { useCallback, useState } from "react";

import type { DataExplorerLoadPage } from "@/shared/admin/templates/DataExplorer/DataExplorer";
import type { EntityStatus } from "@/shared/admin/templates/StatusBadge";

import { listCustomersPage } from "../services/customer.service";
import type { ManagedCustomer } from "../types/customer.types";

export type CustomerStatusFilter = EntityStatus | "all";

/** Tải theo trang từ Backend (10 khách/lượt); tìm kiếm và lọc trạng thái do Backend xử lý. */
export function useCustomersExplorer() {
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>("all");

  const loadPage = useCallback<DataExplorerLoadPage<ManagedCustomer>>(
    async (query, signal) => {
      const page = await listCustomersPage(
        { ...query, status: statusFilter === "all" ? undefined : statusFilter },
        signal,
      );
      return { items: page.items, totalItems: page.totalItems };
    },
    [statusFilter],
  );

  return { loadPage, statusFilter, setStatusFilter };
}
