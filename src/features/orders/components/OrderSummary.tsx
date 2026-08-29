import { MoneyDisplay } from "@/components/shared/MoneyDisplay";

import type { ManagedOrder } from "../types/order.types";

type OrderSummaryProps = {
  order: ManagedOrder;
};

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <div className="rounded-lg border border-brand-line bg-white p-6">
      <h2 className="text-[15px] font-black text-brand-greenDark">Tổng kết đơn hàng</h2>

      <dl className="mt-4 space-y-2 text-[14px]">
        <div className="flex items-center justify-between">
          <dt className="text-brand-muted">Tạm tính</dt>
          <dd>
            <MoneyDisplay value={order.subtotal} />
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-brand-muted">Giảm giá</dt>
          <dd>-<MoneyDisplay value={order.discount} /></dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-brand-muted">Phí giao hàng</dt>
          <dd>
            <MoneyDisplay value={order.deliveryFee} />
          </dd>
        </div>

        <div className="flex items-center justify-between border-t border-brand-line pt-2 text-[15px] font-black text-brand-greenDark">
          <dt>Tổng cộng</dt>
          <dd>
            <MoneyDisplay value={order.totalAmount} />
          </dd>
        </div>
      </dl>
    </div>
  );
}
