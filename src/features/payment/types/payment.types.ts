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

/**
 * Trạng thái của PaymentSession (Backend) — KHÁC PaymentStatus của ManagedPayment (features/orders:
 * pending/paid/failed/refunded/cancelled). "success" nghĩa là nhân viên đã xác nhận nhận được tiền VÀ đơn hàng đã được tạo;
 * hết hạn mà chưa xác nhận thì Backend tự chuyển "cancelled".
 */
export const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ thanh toán" },
  { value: "success", label: "Thành công" },
  { value: "failed", label: "Thất bại" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS_OPTIONS)[number]["value"];

export type PaymentSessionModifier = {
  groupId: string;
  groupName: string;
  optionId: string;
  optionLabel: string;
  priceAdjustment: number;
};

/** Một dòng món như đã báo giá lúc tạo phiên (chỉ để hiển thị — xác nhận sẽ tính lại giá ở Backend). */
export type PaymentSessionItem = {
  productId: string;
  productName: string;
  /** Id media của ảnh món (chưa đổi sang URL — trang thanh toán không hiển thị ảnh). */
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  note?: string;
  modifiers: PaymentSessionModifier[];
};

/**
 * PaymentSession = "giữ chỗ" đơn hàng cho QR/DIGITAL_WALLET — Backend CHƯA tạo đơn cho tới khi nhân viên xác nhận đã nhận tiền
 * (Admin → Sales → Thanh toán). Khách chuyển khoản theo thông tin ngân hàng + mã tham chiếu rồi chờ; trang thanh toán tự
 * kiểm tra trạng thái cho tới khi "success" và chuyển sang trang theo dõi đơn. CASH bỏ qua session này — đặt đơn ngay.
 *
 * Mọi số tiền do Backend tính (client không gửi) và là con số KHÁCH PHẢI TRẢ; thông tin ngân hàng là của phương thức thanh
 * toán tại thời điểm tạo phiên.
 */
export interface PaymentSession {
  id: string;
  /** Mã tham chiếu giao dịch — khách ghi vào nội dung chuyển khoản để nhân viên đối chiếu. */
  referenceCode: string;
  status: PaymentStatus;

  /** Suy ra từ kênh của phương thức: "qr" → QR, "digital_wallet" → DIGITAL_WALLET. */
  paymentMethod: Exclude<PaymentMethod, "CASH">;
  paymentMethodCode: string;
  paymentMethodLabel: string;

  customerName: string;
  phone: string;
  email?: string;

  items: PaymentSessionItem[];

  deliveryMethodCode: string;
  deliveryMethodLabel: string;
  isPickup: boolean;
  deliveryAddressSnapshot: string;

  wantsUtensils: boolean;
  note?: string;
  orderOptionSelections: PaymentSessionModifier[];

  subtotal: number;
  shippingFee: number;
  discount: number;
  discountCode?: string;
  shippingDiscount: number;
  totalAmount: number;

  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;

  /** Có sau khi phiên thành công (đơn đã được tạo). */
  orderId: string | null;
  orderCode: string | null;
  /** Lý do khi nhân viên từ chối ("Chưa thấy tiền chuyển khoản") hoặc phiên hết hạn — hiển thị cho khách. */
  resolutionNote?: string;

  createdAt: string;
  updatedAt: string;
  /** Mốc hết hạn giữ chỗ (theo cấu hình Cấu hình đơn hàng) — quá hạn mà chưa được xác nhận thì phiên tự hủy. */
  expiresAt: string;
}
