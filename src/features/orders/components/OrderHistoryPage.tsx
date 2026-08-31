"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { formatCurrency } from "@/lib/format-currency";
import MenuBackgroundDecoration from "@/components/ui/MenuBackgroundDecoration";
// Import thẳng (không qua barrel @/features/auth, @/features/orders) — 2
// barrel này re-export UI admin/AuthModal, lý do đầy đủ xem
// features/menu/services/menu.service.ts.
import { useAuth } from "@/features/auth/context/auth-context";
import { listCustomerOrders } from "../services/order.service";
import { resolveCustomerOrderStatusLabel } from "../utils/customer-order-status-label";
import { PAYMENT_STATUS_LABEL } from "../types/payment-status";
import { useReorder } from "../hooks/useReorder";
import type { ManagedOrder } from "../types/order.types";

/**
 * #19 ORDER HISTORY (/tai-khoan/don-hang) — chỉ hiển thị khi đã đăng nhập,
 * lọc theo AuthUser.customerId (bridge Auth↔Customer, xem
 * features/customers/services/customer.service.ts#findOrCreateCustomerByContact).
 */
export function OrderHistoryPage() {
  const { user, isAuthLoaded, logout } = useAuth();
  const { reorder, isReordering } = useReorder();

  const [orders, setOrders] = useState<ManagedOrder[] | null>(null);
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.customerId) {
      setOrders([]);
      return;
    }

    listCustomerOrders(user.customerId).then(setOrders);
  }, [user?.customerId]);

  async function handleReorder(order: ManagedOrder) {
    setReorderNotice(null);
    const result = await reorder(order);

    if (result.skippedCount > 0) {
      setReorderNotice(`Đã thêm ${result.addedCount} món vào giỏ hàng. ${result.skippedCount} món không còn khả dụng nên đã bỏ qua.`);
    }
  }

  return (
    <div className="relative isolate w-full min-h-screen bg-[#ff9418] px-5 py-28 md:px-0">
      <MenuBackgroundDecoration leftColor="#F5C884" rightColor="#F5C884" />

      <div className="mx-auto max-w-[730px] space-y-3">
        <section className="rounded-lg bg-white p-7 shadow-soft">
          <div className="flex items-center justify-between">
            <h1 className="text-[18px] font-black text-brand-green">ĐƠN HÀNG CỦA TÔI</h1>

            {user && (
              <button
                type="button"
                onClick={logout}
                className="text-[13px] font-bold text-[#7a7a7a] transition hover:text-brand-red"
              >
                Đăng xuất
              </button>
            )}
          </div>

          {!isAuthLoaded ? (
            <p className="mt-4 text-[13px] text-[#4b4b4b]">Đang tải...</p>
          ) : !user ? (
            <div className="mt-4 rounded border border-dashed border-[#9cae9e] p-10 text-center text-[15px] text-[#4b4b4b]">
              Vui lòng đăng nhập để xem đơn hàng của bạn.
              <div className="mt-4">
                <Link
                  href="/"
                  className="inline-block rounded-md bg-brand-red px-6 py-3 text-[14px] font-black text-white transition hover:opacity-90"
                >
                  Về trang chủ để đăng nhập
                </Link>
              </div>
            </div>
          ) : orders === null ? (
            <p className="mt-4 text-[13px] text-[#4b4b4b]">Đang tải danh sách đơn hàng...</p>
          ) : orders.length === 0 ? (
            <div className="mt-4 rounded border border-dashed border-[#9cae9e] p-10 text-center text-[15px] text-[#4b4b4b]">
              Bạn chưa có đơn hàng nào.
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
            <div className="mt-4 space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-lg border border-brand-line p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[15px] font-black text-brand-greenDark">{order.orderCode}</p>
                      <p className="mt-0.5 text-[12px] text-[#7a7a7a]">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[16px] font-black text-black">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-[12px] font-bold text-brand-red">
                        {resolveCustomerOrderStatusLabel(order.orderStatus, order.isPickup)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-0.5 text-[13px] text-[#4b4b4b]">
                    <p>Hình thức: {order.deliveryMethodLabel}</p>
                    <p>
                      Thanh toán: {order.paymentMethodLabel} ·{" "}
                      {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/don-hang/${order.orderCode}`}
                      className="flex-1 rounded-md border-2 border-brand-red px-4 py-2 text-center text-[13px] font-bold text-brand-red transition hover:bg-brand-red hover:text-white"
                    >
                      Xem chi tiết
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      disabled={isReordering}
                      className="flex-1 rounded-md bg-brand-red px-4 py-2 text-[13px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isReordering ? "Đang xử lý..." : "Đặt lại"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {reorderNotice && (
            <p className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-3 text-[13px] font-medium text-orange-700">
              {reorderNotice}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
