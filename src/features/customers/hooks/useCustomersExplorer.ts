"use client";

import { useMemo, useState } from "react";

import type { EntityStatus } from "@/components/admin/templates/StatusBadge";
import { useAsyncData } from "@/hooks/useAsyncData";

import { listCustomers } from "../services/customer.service";

export type CustomerStatusFilter = EntityStatus | "all";

export function useCustomersExplorer() {
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>("all");
  const { data, isLoading, error } = useAsyncData(listCustomers, [], {
    fallbackError: "Không thể tải danh sách khách hàng.",
  });

  const rows = useMemo(
    () => (data ?? []).filter((customer) => statusFilter === "all" || customer.status === statusFilter),
    [data, statusFilter],
  );

  return { rows, statusFilter, setStatusFilter, isLoading, loadError: error };
}
