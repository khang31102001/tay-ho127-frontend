import Image from "next/image";

import { MoneyDisplay } from "@/components/shared/MoneyDisplay";

import type { OrderItem } from "../types/order-item.types";

type OrderItemsTableProps = {
  items: OrderItem[];
};

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-brand-line bg-white">
      <table className="w-full min-w-[520px] text-left text-[14px]">
        <thead>
          <tr className="border-b border-brand-line bg-brand-cream/40 text-brand-greenDark">
            <th className="px-4 py-3 font-bold">Sản phẩm</th>
            <th className="px-4 py-3 text-right font-bold">Đơn giá</th>
            <th className="px-4 py-3 text-right font-bold">SL</th>
            <th className="px-4 py-3 text-right font-bold">Thành tiền</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.productId}-${index}`} className="border-b border-brand-line last:border-b-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-brand-line">
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-greenDark">{item.productName}</p>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <ul className="text-[12px] text-brand-muted">
                        {item.modifiers.map((modifier) => (
                          <li key={modifier.optionId}>
                            {modifier.groupName}: {modifier.optionLabel}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.note && <p className="text-[12px] text-brand-muted">{item.note}</p>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <MoneyDisplay value={item.unitPrice} />
              </td>
              <td className="px-4 py-3 text-right">{item.quantity}</td>
              <td className="px-4 py-3 text-right font-bold text-brand-greenDark">
                <MoneyDisplay value={item.lineTotal} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
