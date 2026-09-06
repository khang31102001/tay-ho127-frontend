import type { ChangeEvent } from "react";
import type { CheckoutFormErrors, CheckoutFormState } from "../types/checkout.types";

type CustomerInformationFormProps = {
  form: Pick<CheckoutFormState, "customerName" | "phone" | "email">;
  formErrors: CheckoutFormErrors;
  onTextInputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  getInputClass: (hasError?: boolean) => string;
};

/**
 * #8 CUSTOMER INFORMATION — Họ tên/SĐT bắt buộc, Email tùy chọn. Địa chỉ
 * giao hàng thuộc FulfillmentSummary (đã chọn ở Cart). Không tự bọc outer
 * card — được compose bên trong OrderInformationSection cùng
 * FulfillmentSummary/OrderPreferenceSummary thành 1 card "THÔNG TIN ĐẶT
 * HÀNG" duy nhất.
 */
export function CustomerInformationForm({ form, formErrors, onTextInputChange, getInputClass }: CustomerInformationFormProps) {
  return (
    <div>
      <h3 className="mb-3 text-[14px] font-black text-brand-greenDark">Thông tin khách hàng</h3>

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
    </div>
  );
}
