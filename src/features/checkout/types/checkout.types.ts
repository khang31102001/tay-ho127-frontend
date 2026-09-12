/**
 * paymentMethodId trỏ tới ManagedPaymentMethod.id (features/payment-methods)
 * — Checkout không tự định nghĩa danh sách phương thức cố định, phải fetch
 * động.
 *
 * deliveryMethodId/address/note/utensils (Delivery Method + Order Preferences)
 * đã chuyển sang chọn tại Cart Page (features/cart, CartContext) — Checkout
 * chỉ còn đọc lại các giá trị đó (qua useCart()) để tạo Order, không sở hữu
 * state hay UI của 2 mục này nữa. Xem features/cart/types/cart.types.ts.
 */
export interface CheckoutFormState {
  customerName: string;
  phone: string;
  /** Tùy chọn — theo #8 (CUSTOMER INFORMATION: "Email nếu có"). */
  email: string;
  paymentMethodId: string;
}

export interface CheckoutTotals {
  subtotal: number;
  shippingFee: number;
  discount: number;
  /** Số tiền giảm trên phí giao hàng (mã "free_shipping") — luôn ≤ shippingFee. UI chỉ hiển thị dòng này khi > 0 (xem CheckoutPriceSummary). */
  shippingDiscount: number;
  /**
   * Phí phát sinh khác ngoài phí giao hàng (vd. phí đóng gói) — chưa có
   * business rule/nguồn dữ liệu nào tạo ra giá trị khác 0, để sẵn field cho
   * tương lai. UI chỉ hiển thị dòng này khi > 0 (xem CheckoutPriceSummary).
   */
  otherFee: number;
  /**
   * Thuế/VAT cộng thêm ngoài giá món — giá hiển thị trên thực đơn hiện tại đã
   * bao gồm VAT (không có business rule tách VAT riêng), nên luôn = 0 để
   * KHÔNG cộng VAT lần hai vào Grand Total. Để sẵn field cho khi có business
   * rule tính VAT tách riêng; UI chỉ hiển thị dòng này khi > 0.
   */
  tax: number;
  grandTotal: number;
}

export interface CheckoutFormErrors {
  customerName?: string;
  phone?: string;
  submit?: string;
}

export const INITIAL_CHECKOUT_FORM: CheckoutFormState = {
  customerName: "",
  phone: "",
  email: "",
  paymentMethodId: "",
};
