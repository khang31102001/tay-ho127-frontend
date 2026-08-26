"use client";

import Image from "next/image";
import type { CheckoutOrderPayload, ShippingMethod, PaymentMethod } from "@/types/checkout";
import { SHIPPING_LABELS, PAYMENT_LABELS } from "@/types/checkout";
import { RadioOption } from "@/components/ui/RadioOption";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/data/menu-items";
import { StatusPopup } from "../common/StatusPopup";
import MenuBackgroundDecoration from "../ui/MenuBackgroundDecoration";
import { useCheckoutForm } from "./useCheckoutForm";

export interface CheckoutSectionProps {
  onSubmitOrder?: (order: CheckoutOrderPayload) => Promise<void> | void;
}
export function CheckoutSection({ onSubmitOrder }: CheckoutSectionProps) {
  const { cartItems, totalPrice, updateQuantity, removeFromCart } = useCart();

  const {
    form,
    formErrors,
    popup,
    setPopup,
    isSubmitting,
    totals,
    updateFormField,
    handleTextInputChange,
    handleSubmit,
    getInputClass,
  } = useCheckoutForm({ cartItems, totalPrice, onSubmitOrder });

  return (
    <div className="relative w-full pb-40 pt-24  bg-[#ff9418] min-h-screen px-5 py-28 md:px-0">
     <MenuBackgroundDecoration leftColor="#F5C884" rightColor="#F5C884" />
      <form onSubmit={handleSubmit} className="mx-auto max-w-[730px] space-y-3">
        {/* Danh sách món trong giỏ hàng */}
        <section className="rounded-lg bg-white p-7 shadow-soft">
          <h1 className="mb-5 text-[18px] font-black text-brand-green">
            THỰC ĐƠN CỦA BẠN HÔM NAY
          </h1>

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
                      {item.name}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] font-bold text-black">
                      <span>Số lượng</span>

                      <button
                        type="button"
                        aria-label={`Giảm số lượng ${item.name}`}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-300"
                      >
                        −
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        type="button"
                        aria-label={`Tăng số lượng ${item.name}`}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
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

        {/* Thông tin người đặt hàng */}
        <section className="rounded-lg bg-white p-7 shadow-soft">
          <h2 className="mb-4 text-[18px] font-black text-brand-green">
            THÔNG TIN ĐẶT HÀNG
          </h2>

          <div className="space-y-3 text-[13px] font-medium text-brand-greenDark">
            <label className="block">
              <span className="sr-only">Tên người đặt hàng</span>

              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleTextInputChange}
                placeholder="Tên"
                autoComplete="name"
                className={getInputClass(Boolean(formErrors.customerName))}
              />

              {formErrors.customerName && (
                <span className="mt-1 block px-3 text-xs text-red-500">
                  {formErrors.customerName}
                </span>
              )}
            </label>

            <label className="block">
              <span className="sr-only">Số điện thoại</span>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleTextInputChange}
                placeholder="Số điện thoại"
                autoComplete="tel"
                className={getInputClass(Boolean(formErrors.phone))}
              />

              {formErrors.phone && (
                <span className="mt-1 block px-3 text-xs text-red-500">
                  {formErrors.phone}
                </span>
              )}
            </label>

            <label className="block">
              <span className="sr-only">Địa chỉ giao hàng</span>

              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleTextInputChange}
                placeholder="Địa chỉ giao hàng"
                autoComplete="street-address"
                className={getInputClass(Boolean(formErrors.address))}
              />

              {formErrors.address && (
                <span className="mt-1 block px-3 text-xs text-red-500">
                  {formErrors.address}
                </span>
              )}
            </label>

            <label className="block">
              <span className="sr-only">Ghi chú đơn hàng</span>

              <textarea
                name="note"
                value={form.note}
                onChange={handleTextInputChange}
                placeholder="Nhập yêu cầu của bạn tại đây..."
                className="h-[120px] w-full resize-none rounded-xl border border-[#0f9b55] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#0f9b55]/20"
              />
            </label>
          </div>
        </section>

        {/* Phí giao hàng */}
        <section className="rounded-lg bg-white p-7 shadow-soft">
          <h2 className="mb-4 text-[18px] font-black text-brand-green">
            PHÍ SHIP
          </h2>

          <div className="grid gap-4 text-[13px] md:grid-cols-[1fr_1fr_110px]">
            <p>Thời gian giao dự kiến: khoảng 1 tiếng</p>

            <div className="space-y-3">
              <RadioOption<ShippingMethod>
                name="shippingMethod"
                value="within_5km"
                checked={form.shippingMethod === "within_5km"}
                onChange={(value) => updateFormField("shippingMethod", value)}
                label={SHIPPING_LABELS.within_5km}
              />

              <RadioOption<ShippingMethod>
                name="shippingMethod"
                value="over_5km"
                checked={form.shippingMethod === "over_5km"}
                onChange={(value) => updateFormField("shippingMethod", value)}
                label={SHIPPING_LABELS.over_5km}
              />
            </div>

            <div className="text-left font-black md:text-right">
              {totals.shippingFee === 0 ? (
                <p className="text-brand-green">Freeship!</p>
              ) : (
                <p className="text-brand-red">
                  {formatCurrency(totals.shippingFee)}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Phương thức thanh toán */}
        <section className="rounded-lg bg-white p-7 shadow-soft">
          <h2 className="mb-4 text-[18px] font-black text-brand-green">
            PHƯƠNG THỨC THANH TOÁN
          </h2>

          <div className="grid gap-3 text-[13px] md:grid-cols-2">
            <RadioOption<PaymentMethod>
              name="paymentMethod"
              value="cash"
              checked={form.paymentMethod === "cash"}
              onChange={(value) => updateFormField("paymentMethod", value)}
              label={PAYMENT_LABELS.cash}
            />

            <RadioOption<PaymentMethod>
              name="paymentMethod"
              value="bank_transfer"
              checked={form.paymentMethod === "bank_transfer"}
              onChange={(value) => updateFormField("paymentMethod", value)}
              label={PAYMENT_LABELS.bank_transfer}
            />
          </div>

          {form.paymentMethod === "bank_transfer" && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-[13px] leading-6">
              <p className="font-bold text-brand-greenDark">
                Thông tin chuyển khoản
              </p>

              <p>Ngân hàng: MB Bank</p>
              <p>Số tài khoản: 0000000000</p>
              <p>Chủ tài khoản: TÂY HỒ FOOD</p>
              <p>Nội dung: Tên khách hàng + số điện thoại</p>
            </div>
          )}
        </section>

        {/* Chi tiết thanh toán */}
        <section className="rounded-lg bg-white p-7 shadow-soft">
          <h2 className="mb-4 text-[18px] font-black text-brand-green">
            CHI TIẾT THANH TOÁN
          </h2>

          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between gap-4">
              <span>Tổng tiền món ăn</span>
              <strong>{formatCurrency(totals.subtotal)}</strong>
            </div>

            <div className="flex justify-between gap-4">
              <span>Phí vận chuyển</span>
              <strong>{formatCurrency(totals.shippingFee)}</strong>
            </div>

            <div className="flex justify-between gap-4">
              <span>Giảm giá</span>
              <strong>{formatCurrency(totals.discount)}</strong>
            </div>

            <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-[15px] font-black">
              <span>Tổng thanh toán</span>
              <strong>{formatCurrency(totals.grandTotal)}</strong>
            </div>
          </div>
        </section>

        {/* Thông báo */}
        {formErrors.submit && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-600">
            {formErrors.submit}
          </div>
        )}



        {/* Xác nhận đặt hàng */}
        <div className="flex flex-col items-stretch justify-end gap-5 py-10 text-white sm:flex-row sm:items-center sm:gap-8">
          <strong className="text-[24px]">
            TỔNG CỘNG: {formatCurrency(totals.grandTotal)}
          </strong>

          <button
            type="submit"
            disabled={cartItems.length === 0 || isSubmitting}
            className="rounded-md bg-brand-red px-12 py-4 text-[16px] font-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "ĐANG XỬ LÝ..." : "ĐẶT ĐƠN"}
          </button>
        </div>
      </form>
      <StatusPopup
        open={popup.open}
        status={popup.status}
        title={popup.title}
        description={popup.description}
        onOpenChange={(open) =>
          setPopup((previous) => ({
            ...previous,
            open,
          }))
        }
        actions={[
          {
            id: "close",
            label: "Đóng",
            variant: "secondary",
          },

        ]}
        onActionError={(error) => {
          console.error("Không thể thực hiện:", error);
        }}
      >
        <div>
          <strong>Mã tham chiếu:</strong>{" "}
          ERR-API-20260805
        </div>
      </StatusPopup>
    </div>
  );
}
