import { adminApi } from "@/core/api";

export async function getOrders() {
  return adminApi.get("/orders");
}

export async function getOrderById(id: string) {
  return adminApi.get(`/orders/${id}`);
}

export async function updateOrder(id: string, data: unknown) {
  return adminApi.put(`/orders/${id}`, data);
}

export async function cancelOrder(id: string) {
  return adminApi.post(`/orders/${id}/cancel`, {});
}
