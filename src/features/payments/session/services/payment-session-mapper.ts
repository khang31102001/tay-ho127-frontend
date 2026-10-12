import type { PaymentSession, PaymentSessionItem, PaymentSessionModifier, PaymentStatus } from "../types/payment.types";

/** PaymentSessionResponse của Backend (/api/v1/sales/public/payment-sessions, /sales/payment-sessions). */
export type PaymentSessionDto = {
  id: string;
  referenceCode: string;
  status: PaymentStatus;
  channel: "qr" | "digital_wallet";
  paymentMethodCode: string;
  paymentMethodLabel: string;
  customerName: string;
  phone: string;
  email: string | null;
  deliveryMethodCode: string;
  deliveryMethodLabel: string;
  isPickup: boolean;
  deliveryAddressSnapshot: string;
  wantsUtensils: boolean;
  note: string | null;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    note: string | null;
    modifiers: PaymentSessionModifier[];
  }>;
  orderOptionSelections: PaymentSessionModifier[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  discountCode: string | null;
  shippingDiscount: number;
  totalAmount: number;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  orderId: string | null;
  orderCode: string | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export function toPaymentSession(dto: PaymentSessionDto): PaymentSession {
  const items: PaymentSessionItem[] = dto.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    note: item.note ?? undefined,
    modifiers: item.modifiers,
  }));

  return {
    id: dto.id,
    referenceCode: dto.referenceCode,
    status: dto.status,
    paymentMethod: dto.channel === "qr" ? "QR" : "DIGITAL_WALLET",
    paymentMethodCode: dto.paymentMethodCode,
    paymentMethodLabel: dto.paymentMethodLabel,
    customerName: dto.customerName,
    phone: dto.phone,
    email: dto.email ?? undefined,
    items,
    deliveryMethodCode: dto.deliveryMethodCode,
    deliveryMethodLabel: dto.deliveryMethodLabel,
    isPickup: dto.isPickup,
    deliveryAddressSnapshot: dto.deliveryAddressSnapshot,
    wantsUtensils: dto.wantsUtensils,
    note: dto.note ?? undefined,
    orderOptionSelections: dto.orderOptionSelections,
    subtotal: dto.subtotal,
    shippingFee: dto.shippingFee,
    discount: dto.discount,
    discountCode: dto.discountCode ?? undefined,
    shippingDiscount: dto.shippingDiscount,
    totalAmount: dto.totalAmount,
    bankName: dto.bankName ?? undefined,
    bankAccountNumber: dto.bankAccountNumber ?? undefined,
    bankAccountHolder: dto.bankAccountHolder ?? undefined,
    orderId: dto.orderId,
    orderCode: dto.orderCode,
    resolutionNote: dto.resolutionNote ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    expiresAt: dto.expiresAt,
  };
}
