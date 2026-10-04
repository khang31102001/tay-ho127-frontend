/**
 * Registry trạng thái Order — centralized, không hard-code text rải rác ở
 * component (giống SECTION_TYPE_OPTIONS/BANNER_PLACEMENT_OPTIONS đã dùng ở
 * Content). State machine (trạng thái kế tiếp hợp lệ) nằm ở Backend và được trả
 * kèm mỗi đơn (ManagedOrder.nextStatuses) — UI không tự giữ bản sao.
 */
export const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "preparing", label: "Đang chuẩn bị" },
  { value: "ready", label: "Sẵn sàng" },
  { value: "delivering", label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

export type OrderStatus = (typeof ORDER_STATUS_OPTIONS)[number]["value"];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = Object.fromEntries(
  ORDER_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<OrderStatus, string>;

export const ORDER_STATUS_TONE: Record<OrderStatus, "neutral" | "info" | "warning" | "success" | "danger"> = {
  pending: "neutral",
  confirmed: "info",
  preparing: "warning",
  ready: "warning",
  delivering: "info",
  completed: "success",
  cancelled: "danger",
};
