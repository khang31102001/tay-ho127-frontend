import { formatCurrency } from "@/lib/format-currency";
import type { PaymentSession } from "../types/payment.types";

type DigitalWalletPaymentViewProps = {
  session: PaymentSession;
};

/** PaymentMethod === "DIGITAL_WALLET" (Apple Pay/Google Pay/...) — minh họa chuyển tới Provider, chưa tích hợp gateway thật. */
export function DigitalWalletPaymentView({ session }: DigitalWalletPaymentViewProps) {
  return (
    <section className="rounded-lg bg-white p-7 text-center shadow-soft">
      <h2 className="mb-2 text-[15px] font-black text-brand-greenDark">Chuyển đến {session.paymentMethodLabel}</h2>
      <p className="text-[13px] text-[#4b4b4b]">
        Bạn sẽ được chuyển đến {session.paymentMethodLabel} để hoàn tất thanh toán{" "}
        <strong className="text-brand-greenDark">{formatCurrency(session.totalAmount)}</strong>.
      </p>
      <p className="mt-1 text-[12px] text-[#9a9a9a]">(Minh họa — chưa tích hợp cổng thanh toán thật)</p>
    </section>
  );
}
