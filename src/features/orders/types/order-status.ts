/**
 * Registry trạng thái Order — centralized, không hard-code text rải rác ở
 * component (giống SECTION_TYPE_OPTIONS/BANNER_PLACEMENT_OPTIONS đã dùng ở
 * Content). Kèm state machine ORDER_STATUS_TRANSITIONS để Order Detail chỉ
 * hiện action hợp lệ VÀ order.service.ts validate lại trước khi ghi —
 * không chỉ ẩn ở UI.
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

/**
 * Trạng thái kế tiếp hợp lệ cho từng trạng thái hiện tại. COMPLETED/CANCELLED
 * là trạng thái cuối — mảng rỗng, không thể chuyển đi đâu nữa (không được
 * quay ngược lại PENDING).
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivering", "cancelled"],
  delivering: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const ORDER_STATUS_TONE: Record<OrderStatus, "neutral" | "info" | "warning" | "success" | "danger"> = {
  pending: "neutral",
  confirmed: "info",
  preparing: "warning",
  ready: "warning",
  delivering: "info",
  completed: "success",
  cancelled: "danger",
};
