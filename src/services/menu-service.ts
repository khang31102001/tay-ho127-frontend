import menuJson from "../api/menu-api-response.json";
import type { MenuResponse } from "@/types/menu";

// Giả lập gọi API lấy menu. Trả về object giống nội dung file JSON với delay nhỏ.
export async function fetchMenu(): Promise<MenuResponse> {
  // Simulate network latency
  await new Promise((res) => setTimeout(res, 300));
  return menuJson as unknown as MenuResponse;
}
