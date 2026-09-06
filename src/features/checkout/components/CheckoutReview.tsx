"use client";

import { useCart } from "@/features/cart";
import { formatCurrency } from "@/lib/format-currency";
import { StatusPopup } from "@/components/shared/StatusPopup";
import { PriceSummary } from "@/components/shared/PriceSummary";
import MenuBackgroundDecoration from "@/components/ui/MenuBackgroundDecoration";
import { resolvePaymentMethod } from "@/features/payment";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { CheckoutItemsList } from "./CheckoutItemsList";
import { OrderInformationSection } from "./OrderInformationSection";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

/**
 * #9 CHECKOUT REVIEW — trang review-only: KHÔNG sửa số lượng/xóa món, KHÔNG
 * sửa Fulfillment/Order Preferences (tất cả thuộc Cart Page /gio-hang — xem
 * OrderInformationSection). Bố cục theo đúng luồng đọc tự nhiên: đang mua gì
 * → giao cho ai/nhận thế nào/tùy chọn gì → bao nhiêu tiền → thanh toán bằng
 * gì → xác nhận:
 *
 *   1. THỰC ĐƠN CỦA BẠN HÔM NAY (CheckoutItemsList)
 *   2. THÔNG TIN ĐẶT HÀNG (OrderInformationSection — Customer [editable] +
 *      Fulfillment/Order Preferences [read-only, đã chọn ở Cart])
 *   3. TÓM TẮT THANH TOÁN (PriceSummary)
 *   4. PHƯƠNG THỨC THANH TOÁN (PaymentMethodSelector)
 *   5. CTA — nhãn/hành động phụ thuộc payment method đã chọn, xem
 *      useCheckoutForm.handleSubmit: COD tạo Order ngay, các phương thức còn
 *      lại tạo CheckoutSession rồi sang Payment Confirmation.
 */
export function CheckoutReview() {
  const { cartItems, totalPrice, clearCart, address, utensils, note, orderOptionSelections } = useCart();

  const {
    form,
    formErrors,
    popup,
    setPopup,
    isSubmitting,
    isCartReviewed,
    totals,
    paymentMethods,
    selectedDeliveryMethod,
    selectedPaymentMethod,
    isLoadingMethods,
    updateFormField,
    handleTextInputChange,
    handleSubmit,
    getInputClass,
  } = useCheckoutForm({ cartItems, totalPrice, clearCart });

  /**
   * `isCartReviewed` bắt đầu ở `null` trong lúc useCheckoutForm kiểm tra cờ
   * đã review — không render form Checkout cho tới khi xác nhận xong, tránh
   * nháy nội dung Checkout ngay trước khi bị điều hướng ngược về /gio-hang.
   */
  if (!isCartReviewed) {
    return null;
  }

  // CASH không cần "tiếp tục" sang bước thanh toán online nào nữa — nhãn CTA phản ánh đúng hành động sắp xảy ra.
  const ctaLabel =
    selectedPaymentMethod && resolvePaymentMethod(selectedPaymentMethod.group) === "CASH"
      ? "ĐẶT HÀNG"
      : "TIẾP TỤC THANH TOÁN";

  return (
    <div className="relative isolate w-full pb-40 pt-24  bg-[#ff9418] min-h-screen px-5 py-28 md:px-0">
      <MenuBackgroundDecoration leftColor="#F5C884" rightColor="#F5C884" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-[730px] space-y-3">
        <CheckoutItemsList cartItems={cartItems} orderOptionSelections={orderOptionSelections} />

        <OrderInformationSection
          form={form}
          formErrors={formErrors}
          onTextInputChange={handleTextInputChange}
          getInputClass={getInputClass}
          selectedDeliveryMethod={selectedDeliveryMethod}
          address={address}
          isLoadingDeliveryMethod={isLoadingMethods}
          utensils={utensils}
          note={note}
        />

        <PriceSummary
          title="TÓM TẮT THANH TOÁN"
          subtotal={totals.subtotal}
          shippingFee={totals.shippingFee}
          discount={totals.discount}
          grandTotal={totals.grandTotal}
        />

        <PaymentMethodSelector
          methods={paymentMethods}
          selectedMethodId={form.paymentMethodId}
          selectedMethod={selectedPaymentMethod}
          onSelect={(methodId) => updateFormField("paymentMethodId", methodId)}
          isLoading={isLoadingMethods}
        />

        {formErrors.submit && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-600">
            {formErrors.submit}
          </div>
        )}

        <div className="flex flex-col items-stretch justify-end gap-5 py-10 text-white sm:flex-row sm:items-center sm:gap-8">
          <strong className="text-[24px]">TỔNG CỘNG: {formatCurrency(totals.grandTotal)}</strong>

          <button
            type="submit"
            disabled={cartItems.length === 0 || isSubmitting || isLoadingMethods}
            className="rounded-md bg-brand-red px-12 py-4 text-[16px] font-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "ĐANG XỬ LÝ..." : ctaLabel}
          </button>
        </div>
      </form>

      <StatusPopup
        open={popup.open}
        status={popup.status}
        title={popup.title}
        description={popup.description}
        onOpenChange={(open) => setPopup((previous) => ({ ...previous, open }))}
        actions={[{ id: "close", label: "Đóng", variant: "secondary" }]}
        onActionError={(error) => {
          console.error("Không thể thực hiện:", error);
        }}
      />
    </div>
  );
}
