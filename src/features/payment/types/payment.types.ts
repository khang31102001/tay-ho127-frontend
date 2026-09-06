import type { CartItem } from "@/features/cart";

/**
 * 3 phương thức thanh toán cố định hiển thị ở Checkout (PHƯƠNG THỨC THANH
 * TOÁN) — khác PaymentMethodGroup thật của Admin (features/payment-methods:
 * cod/card/bank_transfer/e_wallet) vì "card" và "e_wallet" cùng gộp vào
 * DIGITAL_WALLET (cùng cần chọn Provider bên thứ ba trước khi thanh toán).
 * Xem utils/resolve-payment-method.ts để map 2 hệ thống này.
 */
export const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Tiền mặt", description: "Thanh toán khi nhận hàng / tại quán" },
  { value: "QR", label: "Mã QR", description: "Quét QR để thanh toán chuyển khoản" },
  {
    value: "DIGITAL_WALLET",
    label: "Ví / ứng dụng thanh toán",
    description: "Apple Pay, Google Pay,...",
  },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHOD_OPTIONS)[number]["value"];

/** Provider cụ thể khi PaymentMethod = DIGITAL_WALLET — có thể bổ sung thêm sau (xem resolveDigitalWalletProvider). */
export const DIGITAL_WALLET_PROVIDER_OPTIONS = [
  { value: "APPLE_PAY", label: "Apple Pay" },
  { value: "GOOGLE_PAY", label: "Google Pay" },
] as const;

export type DigitalWalletProvider = (typeof DIGITAL_WALLET_PROVIDER_OPTIONS)[number]["value"];

/**
 * PaymentStatus của PaymentSession/mock gateway — KHÁC PaymentStatus của
 * ManagedPayment (features/orders: pending/paid/failed/refunded/cancelled).
 * "processing" chỉ tồn tại trong lúc confirmPaymentSession() đang chạy
 * createOrder()/createPayment() thật; "success" mới là lúc Order/Payment thật
 * được tạo (xem services/payment-session.service.ts).
 */
export const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ thanh toán" },
  { value: "processing", label: "Đang xử lý" },
  { value: "success", label: "Thành công" },
  { value: "failed", label: "Thất bại" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS_OPTIONS)[number]["value"];

/**
 * PaymentSession = "giữ chỗ" đơn hàng + phiên thanh toán cho QR/DIGITAL_WALLET
 * — KHÔNG tạo ManagedOrder/ManagedPayment thật cho tới khi mock gateway báo
 * "success" (xem confirmPaymentSession trong payment-session.service.ts).
 * CASH bỏ qua session này hoàn toàn — tạo Order ngay (xem useCheckoutForm).
 *
 * Toàn bộ field bên dưới là SNAPSHOT tại thời điểm khách bấm "TIẾP TỤC THANH
 * TOÁN" — chỉ để HIỂN THỊ tại Payment Page, KHÔNG phải nguồn tin cậy cuối:
 * createOrder() vẫn tự tra cứu lại giá thật từ Catalog khi xác nhận thanh
 * toán thành công, không nới lỏng biên tin cậy Frontend/Backend đã có.
 */
export interface PaymentSession {
  id: string;
  /** Mã tham chiếu giao dịch — hiển thị ở Payment Page, dùng chung làm khoá tra cứu bên mock-payment-gateway. */
  referenceCode: string;
  status: PaymentStatus;

  paymentMethod: PaymentMethod;
  digitalWalletProvider?: DigitalWalletProvider;
  /** code/label của ManagedPaymentMethod cụ thể khách chọn — cần cho createOrder() (service tự tra cứu lại theo code, không tin Frontend). */
  paymentMethodCode: string;
  paymentMethodLabel: string;

  customerId: string | null;
  customerName: string;
  phone: string;
  email?: string;

  items: CartItem[];

  deliveryMethodCode: string;
  deliveryMethodLabel: string;
  isPickup: boolean;
  deliveryAddressSnapshot: string;

  /** Order Preference — áp dụng cho toàn đơn, đã chọn ở Cart Page. */
  wantsUtensils: boolean;
  note?: string;

  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;

  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;

  /** Chống double-submit — cùng idempotencyKey không tạo 2 session (giống Order). */
  idempotencyKey?: string;

  /** Gắn vào sau khi Order thật được tạo (status chuyển "success"). */
  orderId: string | null;
  orderCode: string | null;

  createdAt: string;
  updatedAt: string;
  /** Mốc hết hạn giữ chỗ (mock: 15 phút kể từ createdAt) — quá hạn mà vẫn "pending" thì tự chuyển "cancelled" khi đọc lại. */
  expiresAt: string;
}
