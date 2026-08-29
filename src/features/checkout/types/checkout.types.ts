/**
 * deliveryMethodId/paymentMethodId trỏ tới ManagedDeliveryMethod/ManagedPaymentMethod.id
 * (features/delivery-methods, features/payment-methods) — Checkout không còn
 * tự định nghĩa danh sách phương thức cố định, phải fetch động.
 */
export interface CheckoutFormState {
  customerName: string;
  phone: string;
  address: string;
  note: string;
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
  address: "",
  note: "",
  deliveryMethodId: "",
  paymentMethodId: "",
};
