export const PAYMENT_METHOD_TYPE_OPTIONS = [
  { value: "offline", label: "Ngoại tuyến (COD / Chuyển khoản tay)" },
  { value: "online", label: "Trực tuyến (Cổng thanh toán)" },
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPE_OPTIONS)[number]["value"];

/**
 * PaymentMethod = lựa chọn thanh toán Admin cấu hình để hiển thị ở Checkout
 * (khác với ManagedPayment ở features/payments — đó là 1 giao dịch thực tế
 * đã phát sinh). Checkout phải gọi listAvailablePaymentMethods() để lấy danh
 * sách động, không hard-code.
 *
 * BankAccount được nhúng trực tiếp vào đây (không tách entity riêng) theo
 * quyết định đã chốt — hệ thống chỉ cần 1 tài khoản/phương thức, chưa cần
 * nhiều tài khoản ngân hàng cho cùng 1 PaymentMethod.
 */
export type ManagedPaymentMethod = {
  id: string;
  code: string;
  name: string;
  description?: string;
  iconMediaId: string | null;
  type: PaymentMethodType;
  /** Chỉ có ý nghĩa khi type = "online" (vd. "vnpay", "momo", "zalopay", "stripe"). */
  gateway?: string;
  /** Hướng dẫn hiển thị ở Checkout (vd. nội dung chuyển khoản, lưu ý khi nhận COD). */
  instructions?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  bankBranch?: string;
  displayOrder: number;
  isActive: boolean;
  isDefault: boolean;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  createdAt: string;
  updatedAt: string;
};
