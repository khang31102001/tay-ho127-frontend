import { PriceSummary } from "@/components/shared/PriceSummary";
import type { PaymentSession } from "../types/payment.types";

type PaymentSummaryProps = {
  session: PaymentSession;
};

/** Header + tổng tiền/mã tham chiếu của Payment Page — tái sử dụng PriceSummary (components/shared) thay vì viết lại bảng subtotal/shippingFee/discount/grandTotal. */
export function PaymentSummary({ session }: PaymentSummaryProps) {
  return (
    <>
      <section className="rounded-lg bg-white p-7 text-center shadow-soft">
        <h1 className="text-[18px] font-black text-brand-green">
          THANH TOÁN QUA {session.paymentMethodLabel.toUpperCase()}
        </h1>
        <p className="mt-1 text-[13px] text-[#4b4b4b]">Mã tham chiếu: {session.referenceCode}</p>
      </section>

      <PriceSummary
        title="TÓM TẮT ĐƠN HÀNG"
        subtotal={session.subtotal}
        shippingFee={session.shippingFee}
        discount={session.discount}
        shippingDiscount={session.shippingDiscount}
        grandTotal={session.totalAmount}
      />
    </>
  );
}
