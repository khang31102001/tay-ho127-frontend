import { adminApi } from "@/lib/http/admin-api";

import type { ManagedOrderSettings, OrderSettingsFormValue } from "../types/order-settings.types";

/**
 * Admin → Cấu hình → Cấu hình đơn hàng, gọi Backend /api/v1/sales/order-settings (quyền order-settings.view|update).
 * Singleton: chỉ có get/update; Backend tự tạo bản ghi mặc định (TH127 / yyMMdd / 5 / 15 phút) khi chưa có.
 *
 * Backend trả 400 nếu: tiền tố không phải 1–16 chữ/số, định dạng ngày ngoài danh sách, độ dài số ngoài 3–8, hoặc thời gian
 * phiên ngoài 5–240 phút.
 */
export function getOrderSettings(): Promise<ManagedOrderSettings> {
  return adminApi.get<ManagedOrderSettings>("/sales/order-settings");
}

export function updateOrderSettings(input: OrderSettingsFormValue): Promise<ManagedOrderSettings> {
  return adminApi.put<ManagedOrderSettings>("/sales/order-settings", input);
}
