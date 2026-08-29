"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

import type { ManagedCustomer } from "../types/customer.types";
import { deleteCustomer, listCustomers } from "../services/customer.service";

export type CustomerStatusFilter = EntityStatus | "all";

export function useCustomersExplorer() {
  const [customers, setCustomers] = useState<ManagedCustomer[]>([]);
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listCustomers();
      setCustomers(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const rows = useMemo(
    () => customers.filter((customer) => statusFilter === "all" || customer.status === statusFilter),
    [customers, statusFilter],
  );

  async function handleDelete(customer: ManagedCustomer) {
    await deleteCustomer(customer.id);
    await loadCustomers();
  }

  return {
    rows,
    statusFilter,
    setStatusFilter,
    isLoading,
    handleDelete,
  };
}
