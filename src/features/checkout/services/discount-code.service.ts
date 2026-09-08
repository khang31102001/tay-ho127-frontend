import { formatCurrency } from "@/lib/format-currency";

const MOCK_DELAY_MS = 400;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

/** Kết quả áp dụng mã thành công — Checkout State giữ nguyên object này để gửi lên `createOrder()`/`createPaymentSession()`. */
export interface AppliedDiscount {
  promotionId: string;
  discountCode: string;
  discountAmount: number;
  description: string;
}

interface DiscountCodeDefinition {
  code: string;
  promotionId: string;
  description: string;
  type: "percent" | "fixed";
  /** percent: 0-100, fixed: số tiền VNĐ. */
  value: number;
  /** Chỉ áp dụng cho type "percent" — chặn số tiền giảm không vượt trần. */
  maxDiscountAmount?: number;
  minSubtotal?: number;
}

/**
 * MOCK CONTRACT — chưa có module Promotion/Discount Code thật ở Backend.
 * Danh sách mã hợp lệ hard-code tạm để demo luồng nhập mã → validate → tính
 * discountAmount → cộng vào Checkout Totals. Khi có API thật, chỉ cần thay
 * nội dung applyDiscountCode() bằng lời gọi API — chữ ký hàm và shape
 * AppliedDiscount trả về giữ nguyên để useCheckoutForm không phải sửa lại.
 */
const MOCK_DISCOUNT_CODES: DiscountCodeDefinition[] = [
  {
    code: "TAYHO10",
    promotionId: "promo-tayho10",
    description: "Giảm 10%, tối đa 20.000 đ",
    type: "percent",
    value: 10,
    maxDiscountAmount: 20000,
  },
  {
    code: "FREESHIP15",
    promotionId: "promo-freeship15",
    description: "Giảm 15.000 đ cho đơn từ 100.000 đ",
    type: "fixed",
    value: 15000,
    minSubtotal: 100000,
  },
];

/** Validate mã + tính sẵn `discountAmount` theo `subtotal` hiện tại (snapshot tại thời điểm áp dụng, không tính lại sau đó — Checkout Review không cho sửa số lượng món nên subtotal không đổi giữa chừng). */
export async function applyDiscountCode(rawCode: string, subtotal: number): Promise<AppliedDiscount> {
  await delay();

  const code = rawCode.trim().toUpperCase();
  if (!code) {
    throw new Error("Vui lòng nhập mã giảm giá.");
  }

  const definition = MOCK_DISCOUNT_CODES.find((item) => item.code === code);
  if (!definition) {
    throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
  }

  if (definition.minSubtotal && subtotal < definition.minSubtotal) {
    throw new Error(`Đơn hàng cần tối thiểu ${formatCurrency(definition.minSubtotal)} để áp dụng mã này.`);
  }

  const rawDiscountAmount =
    definition.type === "percent" ? Math.round((subtotal * definition.value) / 100) : definition.value;
  const cappedDiscountAmount = definition.maxDiscountAmount
    ? Math.min(rawDiscountAmount, definition.maxDiscountAmount)
    : rawDiscountAmount;

  return {
    promotionId: definition.promotionId,
    discountCode: definition.code,
    discountAmount: Math.min(cappedDiscountAmount, subtotal),
    description: definition.description,
  };
}
