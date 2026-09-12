import { formatCurrency } from "@/lib/format-currency";

type PriceSummaryProps = {
  subtotal: number;
  shippingFee: number;
  discount: number;
  /** Số tiền giảm trên shippingFee (mã "free_shipping") — không truyền hoặc 0 thì ẩn dòng này. */
  shippingDiscount?: number;
  grandTotal: number;
  title?: string;
};

/**
 * Khối "Chi tiết thanh toán" review-only (không có ô nhập mã giảm giá), dùng
 * chung giữa OrderTrackingPage (features/orders, đã đặt xong) và
 * PaymentSummary (features/payment) — cả 2 chỉ hiển thị lại subtotal/
 * shippingFee/discount/grandTotal đã chốt, không cho sửa gì thêm.
 *
 * Checkout (features/checkout) có `CheckoutPriceSummary` RIÊNG — không dùng
 * component này — vì cần thêm ô nhập mã giảm giá tương tác (DiscountCodeSection)
 * và 2 dòng phí `otherFee`/`tax`, khác trách nhiệm thật sự chứ không chỉ khác
 * appearance (xem features/checkout/components/CheckoutPriceSummary.tsx).
 */
export function PriceSummary({
  subtotal,
  shippingFee,
  discount,
  shippingDiscount = 0,
  grandTotal,
  title = "CHI TIẾT THANH TOÁN",
}: PriceSummaryProps) {
  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <h2 className="mb-4 text-[18px] font-black text-brand-green">{title}</h2>

      <div className="space-y-2 text-[13px]">
        <div className="flex justify-between gap-4">
          <span>Tổng tiền món ăn</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>

        <div className="flex justify-between gap-4">
          <span>Phí vận chuyển</span>
          <strong>{formatCurrency(shippingFee)}</strong>
        </div>

        {shippingDiscount > 0 && (
          <div className="flex justify-between gap-4">
            <span>Giảm phí vận chuyển</span>
            <strong>-{formatCurrency(shippingDiscount)}</strong>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <span>Giảm giá</span>
          <strong>{formatCurrency(discount)}</strong>
        </div>

        <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-[15px] font-black">
          <span>Tổng thanh toán</span>
          <strong>{formatCurrency(grandTotal)}</strong>
        </div>
      </div>
    </section>
  );
}
