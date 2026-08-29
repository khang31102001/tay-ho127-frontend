"use client";

import { useEffect, useMemo, useState } from "react";
import { listOrders } from "../services/order.service";
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

function isWithinDateFilter(createdAt: string, filter: OrderDateFilter): boolean {
  if (filter === "all") return true;
  const days = DATE_FILTER_DAYS[filter];
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() >= threshold;
}

export function useOrdersExplorer() {
  const [orders, setOrders] = useState<ManagedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<OrderDateFilter>("all");

  useEffect(() => {
    let isMounted = true;
    listOrders().then((data) => {
      if (isMounted) {
        setOrders(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.orderStatus !== statusFilter) return false;
      if (paymentFilter !== "all" && order.paymentStatus !== paymentFilter) return false;
      if (!isWithinDateFilter(order.createdAt, dateFilter)) return false;
      return true;
    });
  }, [orders, statusFilter, paymentFilter, dateFilter]);

  return {
    orders: filteredOrders,
    isLoading,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    dateFilter,
    setDateFilter,
  };
}
