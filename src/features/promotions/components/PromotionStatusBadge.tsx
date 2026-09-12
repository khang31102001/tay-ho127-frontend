import { PROMOTION_STATUS_LABEL, PROMOTION_STATUS_TONE, type PromotionStatus } from "../types/promotion.types";

type PromotionStatusBadgeProps = {
  status: PromotionStatus;
};

const TONE_CLASS: Record<(typeof PROMOTION_STATUS_TONE)[PromotionStatus], string> = {
  neutral: "bg-brand-muted/10 text-brand-muted",
  success: "bg-brand-green/10 text-brand-greenDark",
  danger: "bg-red-50 text-red-600",
};

/**
 * Đặt tại features/promotions (không dùng StatusBadge chung của
 * components/admin/templates) vì Promotion có 4 trạng thái (draft/active/
 * inactive/expired), không phải 2 trạng thái nhị phân active/inactive như
 * StatusBadge giả định — giống lý do PaymentStatusBadge tách riêng ở
 * features/orders.
 */
export function PromotionStatusBadge({ status }: PromotionStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${TONE_CLASS[PROMOTION_STATUS_TONE[status]]}`}
    >
      {PROMOTION_STATUS_LABEL[status]}
    </span>
  );
}
