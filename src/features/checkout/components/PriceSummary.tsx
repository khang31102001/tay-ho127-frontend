import { formatCurrency } from "@/lib/format-currency";

type PriceSummaryProps = {
  subtotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
  title?: string;
};

/**
 * Khối "Chi tiết thanh toán" dùng chung giữa CheckoutReview (đang nhập) và
 * OrderTrackingPage — features/orders (đã đặt xong) — trước đây 2 nơi lặp lại
 * y hệt cấu trúc subtotal/shippingFee/discount/grandTotal, tách ra đây để sửa 1 chỗ.
 */
export function PriceSummary({ subtotal, shippingFee, discount, grandTotal, title = "CHI TIẾT THANH TOÁN" }: PriceSummaryProps) {
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
