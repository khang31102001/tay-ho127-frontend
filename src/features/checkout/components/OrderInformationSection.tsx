import type { ChangeEvent } from "react";
import type { ManagedDeliveryMethod } from "@/features/delivery-methods";
import type { UtensilsPreference } from "@/features/cart";
import type { CheckoutFormErrors, CheckoutFormState } from "../types/checkout.types";
import { CustomerInformationForm } from "./CustomerInformationForm";
import { FulfillmentSummary } from "./FulfillmentSummary";
import { OrderPreferenceSummary } from "./OrderPreferenceSummary";

type OrderInformationSectionProps = {
  form: Pick<CheckoutFormState, "customerName" | "phone" | "email">;
  formErrors: CheckoutFormErrors;
  onTextInputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  getInputClass: (hasError?: boolean) => string;
  selectedDeliveryMethod: ManagedDeliveryMethod | undefined;
  address: string;
  isLoadingDeliveryMethod: boolean;
  utensils: UtensilsPreference;
  note: string;
};

/**
 * "THÔNG TIN ĐẶT HÀNG" — gộp Customer Information (editable) + Fulfillment
 * và Order Preferences (READ-ONLY, đã chọn ở Cart) vào 1 card duy nhất thay
 * vì 3 section rời rạc như trước — bố cục chặt chẽ hơn. Chỉ compose lại 3
 * component sẵn có (mỗi component vẫn giữ đúng 1 responsibility, đã bỏ outer
 * card riêng), không viết lại logic/state của chúng.
 */
export function OrderInformationSection({
  form,
  formErrors,
  onTextInputChange,
  getInputClass,
  selectedDeliveryMethod,
  address,
  isLoadingDeliveryMethod,
  utensils,
  note,
}: OrderInformationSectionProps) {
  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <h2 className="mb-4 text-[18px] font-black text-brand-green">THÔNG TIN ĐẶT HÀNG</h2>

      <div className="space-y-5 divide-y divide-[#0f9b55]/15">
        <CustomerInformationForm
          form={form}
          formErrors={formErrors}
          onTextInputChange={onTextInputChange}
          getInputClass={getInputClass}
        />

        <div className="pt-5">
          <FulfillmentSummary
            selectedMethod={selectedDeliveryMethod}
            address={address}
            isLoading={isLoadingDeliveryMethod}
          />
        </div>

        <div className="pt-5">
          <OrderPreferenceSummary utensils={utensils} note={note} />
        </div>
      </div>
    </section>
  );
}
