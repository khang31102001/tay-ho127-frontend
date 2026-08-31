"use client";

import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@/lib/format-currency";
import MenuBackgroundDecoration from "@/components/ui/MenuBackgroundDecoration";
import { useCart } from "../context/cart-context";
import { CrossSellProducts } from "./CrossSellProducts";

/**
 * Cart Page đầy đủ (/gio-hang) — KHÁC Checkout (/checkout): chỉ xem/sửa giỏ
 * hàng (số lượng, xóa món), KHÔNG có form thông tin khách hàng/fulfillment/
 * payment. Trước đây toàn bộ việc này bị gộp chung vào CheckoutSection, vi
 * phạm nguyên tắc Cart ≠ Checkout.
 */
export function CartPageSection() {
  const { cartItems, totalPrice, updateQuantity, removeFromCart } = useCart();

  const isEmpty = cartItems.length === 0;

  return (
    <div className="relative isolate w-full min-h-screen bg-[#ff9418] px-5 py-28 md:px-0">
      <MenuBackgroundDecoration leftColor="#F5C884" rightColor="#F5C884" />

      <div className="mx-auto max-w-[730px] space-y-3">
        <section className="rounded-lg bg-white p-7 shadow-soft">
          <h1 className="mb-5 text-[18px] font-black text-brand-green">GIỎ HÀNG CỦA BẠN</h1>

          {isEmpty ? (
            <div className="rounded border border-dashed border-[#9cae9e] p-10 text-center text-[15px] text-[#4b4b4b]">
              Giỏ hàng trống. Hãy chọn món và thêm vào giỏ hàng để tiếp tục.
              <div className="mt-4">
                <Link
                  href="/thuc-don"
                  className="inline-block rounded-md bg-brand-red px-6 py-3 text-[14px] font-black text-white transition hover:opacity-90"
                >
                  Xem thực đơn
                </Link>
              </div>
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
                    <h2 className="text-[16px] font-black text-brand-greenDark">{item.name}</h2>
                    <p className="mt-1 text-[13px] text-[#4b4b4b]">{formatCurrency(item.price)} / phần</p>

                    {item.modifiers && item.modifiers.length > 0 && (
                      <ul className="mt-1 text-[12px] text-[#7a7a7a]">
                        {item.modifiers.map((modifier) => (
                          <li key={modifier.optionId}>
                            {modifier.groupName}: {modifier.optionLabel}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] font-bold text-black">
                      <span>Số lượng</span>

                      <button
                        type="button"
                        aria-label={`Giảm số lượng ${item.name}`}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-300"
                      >
                        −
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        type="button"
                        aria-label={`Tăng số lượng ${item.name}`}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-300"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 text-sm font-bold text-brand-red"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="self-center text-left text-[16px] font-black text-black sm:text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {!isEmpty && <CrossSellProducts />}

        {!isEmpty && (
          <section className="rounded-lg bg-white p-7 shadow-soft">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 text-[15px] font-bold text-brand-greenDark">
                Tạm tính: <span className="text-[18px] font-black">{formatCurrency(totalPrice)}</span>
                <p className="mt-0.5 text-[12px] font-medium text-[#4b4b4b]">
                  Phí vận chuyển và khuyến mãi (nếu có) sẽ được tính ở bước tiếp theo.
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                <Link
                  href="/thuc-don"
                  className="flex h-12 flex-1 items-center justify-center rounded-md border-2 border-brand-red px-6 text-[14px] font-black text-brand-red transition hover:bg-brand-red hover:text-white sm:flex-none"
                >
                  Chọn thêm món
                </Link>

                <Link
                  href="/checkout"
                  className="flex h-12  items-center justify-center rounded-md bg-brand-red px-8 text-[14px] font-black text-white transition hover:opacity-90 sm:flex-none"
                >
                  Tiến hành đặt hàng
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
