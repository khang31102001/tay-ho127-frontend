import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, type OrderStatus } from "../types/order-status";

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

const TONE_CLASS: Record<(typeof ORDER_STATUS_TONE)[OrderStatus], string> = {
  neutral: "bg-brand-muted/10 text-brand-muted",
  info: "bg-sky-50 text-sky-600",
  warning: "bg-amber-50 text-amber-600",
  success: "bg-brand-green/10 text-brand-greenDark",
  danger: "bg-red-50 text-red-600",
};

/**
 * Đặt tại features/orders (không phải components/shared) vì cần import
 * OrderStatus — component/shared không được phụ thuộc feature nào.
 */
export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${TONE_CLASS[ORDER_STATUS_TONE[status]]}`}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
