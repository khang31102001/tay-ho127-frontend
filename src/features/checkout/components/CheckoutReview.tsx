"use client";

import { useCart } from "@/features/cart";
import { formatCurrency } from "@/lib/format-currency";
import { StatusPopup } from "@/components/shared/StatusPopup";
import MenuBackgroundDecoration from "@/components/ui/MenuBackgroundDecoration";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { CheckoutItemsList } from "./CheckoutItemsList";
import { CustomerInformationForm } from "./CustomerInformationForm";
import { OrderPreferenceForm } from "./OrderPreferenceForm";
import { FulfillmentSelector } from "./FulfillmentSelector";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { PriceSummary } from "./PriceSummary";

/**
 * #9 CHECKOUT REVIEW — trang review-only, KHÔNG sửa số lượng/xóa món (việc đó
 * thuộc Cart Page /gio-hang). Compose từ các section nhỏ (mỗi section 1 file
 * riêng) thay vì 1 component vài trăm dòng như trước — mỗi section đúng 1
 * trong 9 mục của #9: 01 Customer Information, 02 Fulfillment, 03+04 Order
 * Items + Modifiers, 05 Order Preferences, 07 Pricing Summary, 08 Payment
 * Method, 09 Place Order. (06 Promotion chưa có trong scope hiện tại.)
 */
export function CheckoutReview() {
  const { cartItems, totalPrice, clearCart } = useCart();

  const {
    form,
    formErrors,
    popup,
    setPopup,
    isSubmitting,
    totals,
    deliveryMethods,
    paymentMethods,
    selectedPaymentMethod,
    isLoadingMethods,
    updateFormField,
    handleTextInputChange,
    handleSubmit,
    getInputClass,
  } = useCheckoutForm({ cartItems, totalPrice, clearCart });

  return (
    <div className="relative isolate w-full pb-40 pt-24  bg-[#ff9418] min-h-screen px-5 py-28 md:px-0">
      <MenuBackgroundDecoration leftColor="#F5C884" rightColor="#F5C884" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-[730px] space-y-3">
        <CheckoutItemsList cartItems={cartItems} />

        <CustomerInformationForm
          form={form}
          formErrors={formErrors}
          onTextInputChange={handleTextInputChange}
          getInputClass={getInputClass}
        />

        <OrderPreferenceForm
          utensils={form.utensils}
          onUtensilsChange={(value) => updateFormField("utensils", value)}
          note={form.note}
          onNoteChange={handleTextInputChange}
        />

        <FulfillmentSelector
          methods={deliveryMethods}
          selectedMethodId={form.deliveryMethodId}
          onSelectMethod={(methodId) => updateFormField("deliveryMethodId", methodId)}
          address={form.address}
          onAddressChange={handleTextInputChange}
          addressError={formErrors.address}
          shippingFee={totals.shippingFee}
          isLoading={isLoadingMethods}
        />

        <PaymentMethodSelector
          methods={paymentMethods}
          selectedMethodId={form.paymentMethodId}
          selectedMethod={selectedPaymentMethod}
          onSelect={(methodId) => updateFormField("paymentMethodId", methodId)}
          isLoading={isLoadingMethods}
        />

        <PriceSummary
          subtotal={totals.subtotal}
          shippingFee={totals.shippingFee}
          discount={totals.discount}
          grandTotal={totals.grandTotal}
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
            {isSubmitting ? "ĐANG XỬ LÝ..." : "ĐẶT ĐƠN"}
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
