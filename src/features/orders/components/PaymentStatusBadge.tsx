import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE, type PaymentStatus } from "../types/payment-status";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

const TONE_CLASS: Record<(typeof PAYMENT_STATUS_TONE)[PaymentStatus], string> = {
  neutral: "bg-brand-muted/10 text-brand-muted",
  info: "bg-sky-50 text-sky-600",
  warning: "bg-amber-50 text-amber-600",
  success: "bg-brand-green/10 text-brand-greenDark",
  danger: "bg-red-50 text-red-600",
};

/**
 * Đặt tại features/orders (không phải components/shared) vì cần import
 * PaymentStatus — component/shared không được phụ thuộc feature nào.
 */
export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${TONE_CLASS[PAYMENT_STATUS_TONE[status]]}`}
    >
      {PAYMENT_STATUS_LABEL[status]}
    </span>
  );
}
