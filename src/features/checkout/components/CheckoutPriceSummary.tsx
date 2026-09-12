import { formatCurrency } from "@/lib/format-currency";
import type { CheckoutTotals } from "../types/checkout.types";
import type { AppliedDiscount } from "../services/discount-code.service";
import { DiscountCodeSection } from "./DiscountCodeSection";

type CheckoutPriceSummaryProps = {
  totals: CheckoutTotals;
  appliedDiscount: AppliedDiscount | null;
  isApplyingDiscount: boolean;
  discountError?: string;
  onApplyDiscountCode: (code: string) => void;
  onRemoveDiscountCode: () => void;
};

/**
 * "CHI TIẾT THANH TOÁN" bản redesign riêng cho Checkout — KHÔNG dùng chung
 * `PriceSummary` (components/shared, vẫn phục vụ Order Tracking/Payment Page
 * dạng review-only) vì 2 lý do khác biệt trách nhiệm thật sự (không chỉ khác
 * appearance): (1) có ô nhập mã giảm giá tương tác (DiscountCodeSection),
 * (2) thêm 2 dòng phí mới `otherFee`/`tax` chỉ hiện khi > 0.
 *
 * Cấu trúc: mã giảm giá → Tạm tính → Giảm giá → Phí giao hàng → Phí khác (nếu
 * có) → Thuế/VAT (nếu có) → TỔNG CỘNG (nổi bật nền riêng). `totals.tax` luôn 0
 * ở business rule hiện tại (giá món đã bao gồm VAT) nên dòng Thuế/VAT thường
 * ẩn — xem giải thích trong checkout.types.ts.
 */
export function CheckoutPriceSummary({
  totals,
  appliedDiscount,
  isApplyingDiscount,
  discountError,
  onApplyDiscountCode,
  onRemoveDiscountCode,
}: CheckoutPriceSummaryProps) {
  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <h2 className="mb-4 text-[18px] font-black text-brand-green">CHI TIẾT THANH TOÁN</h2>

      <DiscountCodeSection
        appliedDiscount={appliedDiscount}
        isApplying={isApplyingDiscount}
        error={discountError}
        onApply={onApplyDiscountCode}
        onRemove={onRemoveDiscountCode}
      />

      <div className="space-y-2 text-[13px]">
        <div className="flex justify-between gap-4">
          <span>Tạm tính</span>
          <strong>{formatCurrency(totals.subtotal)}</strong>
        </div>

        <div className="flex justify-between gap-4">
          <span>Giảm giá</span>
          <strong className={totals.discount > 0 ? "text-brand-red" : undefined}>
            {totals.discount > 0 ? `-${formatCurrency(totals.discount)}` : formatCurrency(0)}
          </strong>
        </div>

        <div className="flex justify-between gap-4">
          <span>Phí giao hàng</span>
          <strong>{formatCurrency(totals.shippingFee)}</strong>
        </div>

        {totals.shippingDiscount > 0 && (
          <div className="flex justify-between gap-4">
            <span>Giảm phí vận chuyển</span>
            <strong className="text-brand-red">-{formatCurrency(totals.shippingDiscount)}</strong>
          </div>
        )}

        {totals.otherFee > 0 && (
          <div className="flex justify-between gap-4">
            <span>Phí khác</span>
            <strong>{formatCurrency(totals.otherFee)}</strong>
          </div>
        )}

        {totals.tax > 0 && (
          <div className="flex justify-between gap-4">
            <span>Thuế/VAT</span>
            <strong>{formatCurrency(totals.tax)}</strong>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-brand-green/10 px-4 py-3">
        <span className="text-[15px] font-black text-brand-greenDark">TỔNG CỘNG</span>
        <strong className="text-[20px] font-black text-brand-greenDark">{formatCurrency(totals.grandTotal)}</strong>
      </div>
    </section>
  );
}
