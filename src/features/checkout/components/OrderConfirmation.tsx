"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@/lib/format-currency";
import MenuBackgroundDecoration from "@/components/ui/MenuBackgroundDecoration";
import { getOrderById, type ManagedOrder } from "@/features/orders";

type OrderConfirmationProps = {
  orderId: string;
};

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const [order, setOrder] = useState<ManagedOrder | null | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    getOrderById(orderId).then((data) => {
      if (isMounted) setOrder(data ?? null);
    });
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  return (
    <div className="relative isolate w-full min-h-screen bg-[#ff9418] px-5 py-28 md:px-0">
      <MenuBackgroundDecoration leftColor="#F5C884" rightColor="#F5C884" />

      <div className="mx-auto max-w-[730px] space-y-3">
        {order === undefined ? (
          <section className="rounded-lg bg-white p-10 text-center text-[15px] text-[#4b4b4b] shadow-soft">
            Đang tải thông tin đơn hàng...
          </section>
        ) : order === null ? (
          <section className="rounded-lg bg-white p-10 text-center shadow-soft">
            <p className="text-[15px] text-[#4b4b4b]">Không tìm thấy đơn hàng.</p>
            <Link href="/thuc-don" className="mt-4 inline-block font-bold text-brand-green hover:underline">
              ← Quay lại thực đơn
            </Link>
          </section>
        ) : (
          <>
            <section className="rounded-lg bg-white p-7 text-center shadow-soft">
              <p className="text-[40px]">🎉</p>
              <h1 className="mt-2 text-[20px] font-black text-brand-green">Đặt hàng thành công!</h1>
              <p className="mt-1 text-[14px] text-[#4b4b4b]">
                Cảm ơn bạn đã đặt hàng tại Bánh Cuốn Tây Hồ 127.
              </p>
              <p className="mt-3 text-[16px] font-black text-brand-greenDark">Mã đơn hàng: {order.orderCode}</p>
            </section>

            <section className="rounded-lg bg-white p-7 shadow-soft">
              <h2 className="mb-4 text-[18px] font-black text-brand-green">SẢN PHẨM ĐÃ ĐẶT</h2>

              <div>
                {order.items.map((item, index) => (
                  <article
                    key={`${item.productId}-${index}`}
                    className="grid grid-cols-1 gap-4 border-b border-black py-3 last:border-b-0 sm:grid-cols-[115px_1fr_120px]"
                  >
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={105}
                      height={88}
                      className="h-[88px] w-[105px] rounded object-cover"
                    />

                    <div>
                      <h3 className="text-[16px] font-black text-brand-greenDark">{item.productName}</h3>
                      <p className="mt-1 text-[13px] font-bold text-black">Số lượng: {item.quantity}</p>
                    </div>

                    <div className="self-center text-left text-[16px] font-black text-black sm:text-right">
                      {formatCurrency(item.lineTotal)}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-white p-7 shadow-soft">
              <h2 className="mb-4 text-[18px] font-black text-brand-green">THÔNG TIN GIAO NHẬN</h2>

              <div className="space-y-1 text-[13px] text-[#4b4b4b]">
                <p>
                  <strong className="text-brand-greenDark">Người nhận:</strong> {order.customerName} — {order.phone}
                </p>
                <p>
                  <strong className="text-brand-greenDark">Địa chỉ:</strong> {order.deliveryAddressSnapshot}
                </p>
                <p>
                  <strong className="text-brand-greenDark">Hình thức nhận hàng:</strong> {order.deliveryMethodLabel}
                </p>
                <p>
                  <strong className="text-brand-greenDark">Thanh toán:</strong> {order.paymentMethodLabel}
                </p>
                {order.note && (
                  <p>
                    <strong className="text-brand-greenDark">Ghi chú:</strong> {order.note}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg bg-white p-7 shadow-soft">
              <h2 className="mb-4 text-[18px] font-black text-brand-green">CHI TIẾT THANH TOÁN</h2>

              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between gap-4">
                  <span>Tổng tiền món ăn</span>
                  <strong>{formatCurrency(order.subtotal)}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Phí vận chuyển</span>
                  <strong>{formatCurrency(order.deliveryFee)}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Giảm giá</span>
                  <strong>{formatCurrency(order.discount)}</strong>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-[15px] font-black">
                  <span>Tổng thanh toán</span>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>
              </div>
            </section>

            <div className="flex justify-center gap-4 py-8">
              <Link
                href="/thuc-don"
                className="rounded-md bg-white px-8 py-3 text-[14px] font-black text-brand-greenDark"
              >
                Đặt thêm món khác
              </Link>
              <Link href="/" className="rounded-md bg-brand-red px-8 py-3 text-[14px] font-black text-white">
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
