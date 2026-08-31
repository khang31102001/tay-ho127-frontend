/** RadioOption yêu cầu type string — chuyển sang boolean khi submit (xem useCheckoutForm.ts). */
export type UtensilsPreference = "yes" | "no";

/**
 * deliveryMethodId/paymentMethodId trỏ tới ManagedDeliveryMethod/ManagedPaymentMethod.id
 * (features/delivery-methods, features/payment-methods) — Checkout không còn
 * tự định nghĩa danh sách phương thức cố định, phải fetch động.
 *
 * `utensils`/`note` thuộc Order Preference (áp dụng cho TOÀN đơn) — tách khỏi
 * CartItem/Product theo đúng yêu cầu nghiệp vụ, không lưu chung với từng món.
 */
export interface CheckoutFormState {
  customerName: string;
  phone: string;
  /** Tùy chọn — theo #8 (CUSTOMER INFORMATION: "Email nếu có"). */
  email: string;
  address: string;
  note: string;
  utensils: UtensilsPreference;
  deliveryMethodId: string;
  paymentMethodId: string;
}

export interface CheckoutTotals {
  subtotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
}

export interface CheckoutFormErrors {
  customerName?: string;
  phone?: string;
  address?: string;
  submit?: string;
}

export const INITIAL_CHECKOUT_FORM: CheckoutFormState = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  note: "",
  utensils: "yes",
  deliveryMethodId: "",
  paymentMethodId: "",
};
