export type ShippingMethod = "within_5km" | "over_5km";

export type PaymentMethod = "cash" | "bank_transfer";

export interface CheckoutFormState {
  customerName: string;
  phone: string;
  address: string;
  note: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
}

export interface CheckoutTotals {
  subtotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
}

export interface CheckoutOrderItem {
  productId: string | number;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface CheckoutOrderPayload {
  customer: {
    customerName: string;
    phone: string;
    address: string;
    note: string;
  };

  shipping: {
    method: ShippingMethod;
    label: string;
    fee: number;
    estimatedDelivery: string;
  };

  payment: {
    method: PaymentMethod;
    label: string;
  };

  items: CheckoutOrderItem[];

  totals: CheckoutTotals;

  createdAt: string;
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
  shippingMethod: "within_5km",
  paymentMethod: "cash",
};

export const SHIPPING_FEES: Record<ShippingMethod, number> = {
  within_5km: 0,
  over_5km: 10_000,
};

export const SHIPPING_LABELS: Record<ShippingMethod, string> = {
  within_5km: "Khoảng cách giao hàng ≤ 5 km",
  over_5km: "Khoảng cách giao hàng > 5 km",
};

export  const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Tiền mặt",
  bank_transfer: "Chuyển khoản",
};

