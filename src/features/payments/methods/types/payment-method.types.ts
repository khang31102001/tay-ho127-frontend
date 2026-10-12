/**
 * 4 nhóm PHƯƠNG THỨC THANH TOÁN chuẩn hóa (Phase 0 đã chốt) — không dùng
 * nhị phân online/offline như trước vì gộp nhầm bản chất khác nhau (vd. Apple
 * Pay không thuộc nhóm "Chuyển khoản ngân hàng"). Admin có thể thêm nhiều
 * PaymentMethod cùng 1 group (vd. 2 gateway "card" khác nhau).
 */
export const PAYMENT_METHOD_GROUP_OPTIONS = [
  { value: "cod", label: "Tiền mặt khi nhận hàng (COD)" },
  { value: "card", label: "Thẻ / Cổng thanh toán quốc tế (Visa, Mastercard, Apple Pay)" },
  { value: "bank_transfer", label: "Chuyển khoản ngân hàng / QR" },
  { value: "e_wallet", label: "Ví điện tử (Momo, ZaloPay...)" },
] as const;

export type PaymentMethodGroup = (typeof PAYMENT_METHOD_GROUP_OPTIONS)[number]["value"];

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
  group: PaymentMethodGroup;
  /** Chỉ có ý nghĩa khi group = "card" hoặc "e_wallet" (vd. "vnpay", "momo", "zalopay", "stripe"). */
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
