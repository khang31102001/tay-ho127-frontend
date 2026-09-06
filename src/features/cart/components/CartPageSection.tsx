"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import MenuBackgroundDecoration from "@/components/ui/MenuBackgroundDecoration";
import { useCart } from "../context/cart-context";
import { useCartFulfillment } from "../hooks/useCartFulfillment";
import { markCartReviewed } from "../services/cart-review.service";
import { CartItemRow } from "./CartItemRow";
import { CrossSellProducts } from "./CrossSellProducts";
import { FulfillmentSelector } from "./FulfillmentSelector";
import { GeneralOrderOptions } from "./GeneralOrderOptions";

/**
 * Cart Page đầy đủ (/gio-hang) — KHÁC Checkout (/checkout): Cart giờ đây sở
 * hữu luôn CÁCH NHẬN HÀNG + Tùy chọn chung cho đơn hàng (gộp General Order
 * Options + Dụng cụ ăn uống/Ghi chú đơn hàng vào 1 section duy nhất, xem
 * GeneralOrderOptions showOrderPreferences) — khách cấu hình ngay tại giỏ
 * hàng, trước khi qua Checkout (chỉ còn Customer Information/Review Order/
 * Payment Method/Confirm). Giá trị chọn được lưu ở CartContext
 * (deliveryMethodId/address/utensils/note/orderOptionSelections) nên không
 * mất khi điều hướng sang /checkout — xem cart.types.ts.
 *
 * Đây cũng là điểm DUY NHẤT được phép dẫn sang /checkout: bấm "Tiếp tục
 * thanh toán" đánh dấu markCartReviewed() trước khi điều hướng — Checkout
 * dùng cờ này để chặn mọi cách vào thẳng /checkout không qua review (xem
 * cart-review.service.ts). Vì Checkout không còn UI để sửa địa chỉ giao
 * hàng, việc bắt buộc nhập địa chỉ (khi chọn Giao hàng) phải chặn NGAY tại
 * đây trước khi cho phép điều hướng.
 *
 * KHÔNG hiển thị Price Summary ở đây — Cart chỉ tập trung cấu hình đơn hàng,
 * Price Summary (tạm tính/phí ship/giảm giá/tổng thanh toán) chỉ hiện ở
 * Checkout để khách review trước khi xác nhận (xem CheckoutReview.tsx).
 */
export function CartPageSection() {
  const router = useRouter();
  const { cartItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const {
    deliveryMethods,
    isLoadingDeliveryMethods,
    deliveryMethodId,
    setDeliveryMethodId,
    address,
    setAddress,
    selectedDeliveryMethod,
    shippingFee,
  } = useCartFulfillment();

  const [addressError, setAddressError] = useState<string | undefined>();

  const isEmpty = cartItems.length === 0;

  function handleAddressChange(event: ChangeEvent<HTMLInputElement>) {
    setAddress(event.target.value);
    setAddressError(undefined);
  }

  function handleProceedToCheckout() {
    // Chỉ bắt buộc địa chỉ khi giao tận nơi — "Tự đến lấy" dùng địa chỉ cửa hàng, không cần khách nhập.
    if (selectedDeliveryMethod?.type !== "pickup" && !address.trim()) {
      setAddressError("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }

    markCartReviewed();
    router.push("/checkout");
  }

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
                <CartItemRow
                  key={item.id}
                  item={item}
                  onIncrease={(cartItemId) => updateQuantity(cartItemId, item.quantity + 1)}
                  onDecrease={(cartItemId) => updateQuantity(cartItemId, item.quantity - 1)}
                  onRemove={removeFromCart}
                />
              ))}

              <div className="mt-4  pt-4">
                <GeneralOrderOptions showOrderPreferences />
              </div>
            </div>
          )}
        </section>

        {!isEmpty && <CrossSellProducts />}

        {!isEmpty && (
          <FulfillmentSelector
            methods={deliveryMethods}
            selectedMethodId={deliveryMethodId}
            onSelectMethod={setDeliveryMethodId}
            address={address}
            onAddressChange={handleAddressChange}
            addressError={addressError}
            shippingFee={shippingFee}
            isLoading={isLoadingDeliveryMethods}
          />
        )}

        {!isEmpty && (
          <section className="rounded-lg bg-white p-7 shadow-soft">
            <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
              <Link
                href="/thuc-don"
                className="flex h-12 flex-1 items-center justify-center rounded-md border-2 border-brand-red px-6 text-[14px] font-black text-brand-red transition hover:bg-brand-red hover:text-white sm:flex-none"
              >
                Chọn thêm món
              </Link>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={isLoadingDeliveryMethods}
                className="flex h-12 items-center justify-center rounded-md bg-brand-red px-8 text-[14px] font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
