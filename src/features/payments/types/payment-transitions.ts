import type { PaymentStatus } from "@/features/orders";

/**
 * State machine trung tâm cho Payment — song song với ORDER_STATUS_TRANSITIONS
 * bên features/orders nhưng độc lập trục (1 Order COMPLETED vẫn có thể có
 * Payment REFUNDED sau đó). paid/failed đều có thể refund/cancel; refunded và
 * cancelled là terminal state.
 */
export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ["paid", "failed", "cancelled"],
  paid: ["refunded"],
  failed: ["pending", "cancelled"],
  refunded: [],
  cancelled: [],
};
