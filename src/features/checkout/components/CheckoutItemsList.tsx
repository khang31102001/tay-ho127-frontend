import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import type { CartItem } from "@/features/cart";

type CheckoutItemsListProps = {
  cartItems: CartItem[];
};

/**
 * #9 CHECKOUT REVIEW — "03 Order Items" + "04 Item Modifiers". Checkout giờ
 * là REVIEW ONLY (không có nút tăng/giảm/xóa nữa) — sửa số lượng/xóa món phải
 * quay lại Cart Page (/gio-hang), khớp nguyên tắc Cart ≠ Checkout.
 */
export function CheckoutItemsList({ cartItems }: CheckoutItemsListProps) {
  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[18px] font-black text-brand-green">THỰC ĐƠN CỦA BẠN HÔM NAY</h1>

        {cartItems.length > 0 && (
          <Link href="/gio-hang" className="text-[13px] font-bold text-brand-greenDark hover:underline">
            Sửa giỏ hàng
          </Link>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded border border-dashed border-[#9cae9e] p-10 text-center text-[15px] text-[#4b4b4b]">
          Giỏ hàng trống. Hãy chọn món và thêm vào giỏ hàng để tiếp tục.
        </div>
      ) : (
        <div>
          {cartItems.map((item) => (
            <article
              key={item.id}
              className="grid grid-cols-1 gap-4 border-b border-black py-3 last:border-b-0 sm:grid-cols-[115px_1fr_120px]"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={105}
                height={88}
                className="h-[88px] w-[105px] rounded object-cover"
              />

              <div>
                <h2 className="text-[16px] font-black text-brand-greenDark">
                  {item.name} ×{item.quantity}
                </h2>

                {item.modifiers && item.modifiers.length > 0 && (
                  <ul className="mt-1 text-[12px] text-[#7a7a7a]">
                    {item.modifiers.map((modifier) => (
                      <li key={modifier.optionId}>
                        {modifier.groupName}: {modifier.optionLabel}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="self-center text-left text-[16px] font-black text-black sm:text-right">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
