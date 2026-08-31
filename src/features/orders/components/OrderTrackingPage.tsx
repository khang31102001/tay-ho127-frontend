"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@/lib/format-currency";
import MenuBackgroundDecoration from "@/components/ui/MenuBackgroundDecoration";
import { StatusTimeline, type StatusTimelineEntry } from "@/components/shared/StatusTimeline";
// Import thẳng component/service/type (không qua barrel @/features/orders) —
// barrel đó re-export cả Explorer/Editor/Badge admin (UI "use client"), import
// qua barrel ở đây (Site) sẽ kéo UI admin vào bundle Site. Lý do đầy đủ xem
// features/menu/services/menu.service.ts.
import { PriceSummary } from "@/features/checkout/components/PriceSummary";
// Import thẳng (không qua barrel @/features/payments) — barrel đó re-export
// cả Explorer/Detail admin (UI "use client"), lý do đầy đủ xem
// features/menu/services/menu.service.ts.
import { getPaymentByOrderId, retryPayment } from "@/features/payments/services/payment.service";
import type { ManagedPayment } from "@/features/payments/types/payment.types";
import { getOrderByCode } from "../services/order.service";
import { resolveCustomerOrderStatusLabel } from "../utils/customer-order-status-label";
import type { ManagedOrder } from "../types/order.types";

type OrderTrackingPageProps = {
  orderCode: string;
};

/**
 * #17 ORDER SUCCESS + #18 ORDER TRACKING gộp chung 1 trang (/don-hang/{orderCode})
 * — tránh tách thêm 1 trang riêng chỉ để "theo dõi đơn hàng" khi thông tin đó
 * đã hiển thị ngay tại đây (đúng tinh thần #28: hạn chế nhiều trang). Trước
 * đây route là /checkout/thanh-cong/[orderId] (dùng id nội bộ) — đổi sang
 * dùng orderCode (mã công khai) đúng yêu cầu #17.
 */
export function OrderTrackingPage({ orderCode }: OrderTrackingPageProps) {
  const [order, setOrder] = useState<ManagedOrder | null | undefined>(undefined);
  const [payment, setPayment] = useState<ManagedPayment | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getOrderByCode(orderCode).then((data) => {
      if (isMounted) setOrder(data ?? null);
    });
    return () => {
      isMounted = false;
    };
  }, [orderCode]);

  useEffect(() => {
    if (!order) return;
    let isMounted = true;
    getPaymentByOrderId(order.id).then((data) => {
      if (isMounted) setPayment(data ?? null);
    });
    return () => {
      isMounted = false;
    };
  }, [order]);

  async function handleRetryPayment() {
    if (!payment) return;
    setIsRetrying(true);
    try {
      const updated = await retryPayment(payment.id);
      setPayment(updated);
    } catch (error) {
      console.error("Không thể thanh toán lại:", error);
    } finally {
      setIsRetrying(false);
    }
  }

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
              <p className="mt-1 text-[13px] font-bold text-brand-red">
                Trạng thái: {resolveCustomerOrderStatusLabel(order.orderStatus, order.isPickup)}
              </p>
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
                      <h3 className="text-[16px] font-black text-brand-greenDark">
                        {item.productName} ×{item.quantity}
                      </h3>

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
                <p>
                  <strong className="text-brand-greenDark">Dụng cụ ăn uống:</strong>{" "}
                  {order.wantsUtensils ? "Có" : "Không"}
                </p>
                {order.note && (
                  <p>
                    <strong className="text-brand-greenDark">Ghi chú:</strong> {order.note}
                  </p>
                )}
              </div>
            </section>

            <PriceSummary
              subtotal={order.subtotal}
              shippingFee={order.deliveryFee}
              discount={order.discount}
              grandTotal={order.totalAmount}
            />

            {/* #14 PAYMENT FLOW — Order không biến mất khi Payment fail, chỉ hiện nút thanh toán lại. */}
            {payment?.status === "failed" && (
              <section className="rounded-lg border border-red-300 bg-red-50 p-6 text-center shadow-soft">
                <p className="text-[15px] font-black text-red-600">Thanh toán thất bại</p>
                <p className="mt-1 text-[13px] text-red-500">
                  Giao dịch thanh toán cho đơn hàng này chưa thành công. Đơn hàng của bạn vẫn được giữ nguyên.
                </p>

                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="mt-4 rounded-md bg-brand-red px-8 py-3 text-[14px] font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRetrying ? "Đang xử lý..." : "Thanh toán lại"}
                </button>
              </section>
            )}

            {payment?.status === "pending" && payment.paymentMethodCode !== "cod" && (
              <section className="rounded-lg border border-orange-300 bg-orange-50 p-6 text-center shadow-soft">
                <p className="text-[13px] font-bold text-orange-700">
                  Đơn hàng đang chờ xác nhận thanh toán ({order.paymentMethodLabel}).
                </p>
              </section>
            )}

            <section className="rounded-lg bg-white p-7 shadow-soft">
              <h2 className="mb-4 text-[18px] font-black text-brand-green">THEO DÕI ĐƠN HÀNG</h2>

              <StatusTimeline
                entries={order.statusHistory.map(
                  (entry): StatusTimelineEntry => ({
                    label: resolveCustomerOrderStatusLabel(entry.toStatus, order.isPickup),
                    timestamp: entry.changedAt,
                  }),
                )}
              />
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
