import { adminApi } from "@/core/api";

export async function getPayments() {
  return adminApi.get("/payments");
}

export async function getPaymentSessions() {
  return adminApi.get("/payment-sessions");
}

export async function confirmPayment(id: string, data: unknown) {
  return adminApi.put(`/payments/${id}/confirm", data);
}
