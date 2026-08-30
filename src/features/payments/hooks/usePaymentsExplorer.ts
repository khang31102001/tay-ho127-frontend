"use client";

import { useEffect, useMemo, useState } from "react";
import type { PaymentStatus } from "@/features/orders";

import { listPayments } from "../services/payment.service";
import type { ManagedPayment } from "../types/payment.types";

export type PaymentStatusFilter = PaymentStatus | "all";

export function usePaymentsExplorer() {
  const [payments, setPayments] = useState<ManagedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");

  useEffect(() => {
    let isMounted = true;
    listPayments().then((data) => {
      if (isMounted) {
        setPayments(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    if (statusFilter === "all") return payments;
    return payments.filter((payment) => payment.status === statusFilter);
  }, [payments, statusFilter]);

  return { payments: filteredPayments, isLoading, statusFilter, setStatusFilter };
}
