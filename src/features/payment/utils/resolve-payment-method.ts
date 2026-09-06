import type { PaymentMethodGroup } from "@/features/payment-methods";
import type { DigitalWalletProvider, PaymentMethod } from "../types/payment.types";

const PAYMENT_METHOD_BY_GROUP: Record<PaymentMethodGroup, PaymentMethod> = {
  cod: "CASH",
  bank_transfer: "QR",
  card: "DIGITAL_WALLET",
  e_wallet: "DIGITAL_WALLET",
};

/** Gộp 4 PaymentMethodGroup thật (features/payment-methods) thành 3 PaymentMethod hiển thị ở Checkout — "card"/"e_wallet" cùng là DIGITAL_WALLET vì cùng cần chọn Provider bên thứ ba. */
export function resolvePaymentMethod(group: PaymentMethodGroup): PaymentMethod {
  return PAYMENT_METHOD_BY_GROUP[group];
}

const DIGITAL_WALLET_PROVIDER_BY_CODE: Record<string, DigitalWalletProvider> = {
  apple_pay: "APPLE_PAY",
  google_pay: "GOOGLE_PAY",
};

/** Provider cụ thể (Apple Pay/Google Pay) suy ra từ code của ManagedPaymentMethod — trả undefined nếu Admin thêm provider mới chưa khai báo trong DigitalWalletProvider. */
export function resolveDigitalWalletProvider(code: string): DigitalWalletProvider | undefined {
  return DIGITAL_WALLET_PROVIDER_BY_CODE[code];
}
