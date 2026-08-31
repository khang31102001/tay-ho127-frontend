import type { ChangeEvent } from "react";
import type { CheckoutFormErrors, CheckoutFormState } from "../types/checkout.types";

type CustomerInformationFormProps = {
  form: Pick<CheckoutFormState, "customerName" | "phone" | "email">;
  formErrors: CheckoutFormErrors;
  onTextInputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  getInputClass: (hasError?: boolean) => string;
};

/** #8 CUSTOMER INFORMATION — Họ tên/SĐT bắt buộc, Email tùy chọn. Địa chỉ giao hàng thuộc FulfillmentSelector (gắn chặt với lựa chọn Pickup/Delivery). */
export function CustomerInformationForm({ form, formErrors, onTextInputChange, getInputClass }: CustomerInformationFormProps) {
  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <h2 className="mb-4 text-[18px] font-black text-brand-green">THÔNG TIN ĐẶT HÀNG</h2>

      <div className="space-y-3 text-[13px] font-medium text-brand-greenDark">
        <label className="block">
          <span className="sr-only">Tên người đặt hàng</span>

          <input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={onTextInputChange}
            placeholder="Tên"
            autoComplete="name"
            className={getInputClass(Boolean(formErrors.customerName))}
          />

          {formErrors.customerName && (
            <span className="mt-1 block px-3 text-xs text-red-500">{formErrors.customerName}</span>
          )}
        </label>

        <label className="block">
          <span className="sr-only">Số điện thoại</span>

          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onTextInputChange}
            placeholder="Số điện thoại"
            autoComplete="tel"
            className={getInputClass(Boolean(formErrors.phone))}
          />

          {formErrors.phone && <span className="mt-1 block px-3 text-xs text-red-500">{formErrors.phone}</span>}
        </label>

        <label className="block">
          <span className="sr-only">Email (không bắt buộc)</span>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onTextInputChange}
            placeholder="Email (không bắt buộc)"
            autoComplete="email"
            className={getInputClass()}
          />
        </label>
      </div>
    </section>
  );
}
