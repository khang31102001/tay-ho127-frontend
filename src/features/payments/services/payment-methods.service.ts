import { adminApi } from "@/core/api";

export async function getPaymentMethods() {
  return adminApi.get("/payment-methods");
}

export async function createPaymentMethod(data: unknown) {
  return adminApi.post("/payment-methods", data);
}

export async function updatePaymentMethod(id: string, data: unknown) {
  return adminApi.put(`/payment-methods/${id}`, data);
}

export async function deletePaymentMethod(id: string) {
  return adminApi.delete(`/payment-methods/${id}`);
}
