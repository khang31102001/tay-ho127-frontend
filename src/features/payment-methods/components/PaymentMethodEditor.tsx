"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";
import { MediaPicker } from "@/components/shared/MediaPicker";

import { usePaymentMethodEditor } from "../hooks/usePaymentMethodEditor";
import { PAYMENT_METHOD_GROUP_OPTIONS, type PaymentMethodGroup } from "../types/payment-method.types";

type PaymentMethodEditorProps = {
  id?: string;
};

export function PaymentMethodEditor({ id }: PaymentMethodEditorProps) {
  const { form, updateField, mediaOptions, isLoading, isEditMode, handleSave, handleDelete, goToExplore } =
    usePaymentMethodEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa phương thức thanh toán" : "Thêm phương thức thanh toán"}
      backHref="/admin/settings/payment-methods"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Tên phương thức
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Mã (code) — dùng nội bộ, không hiển thị cho khách
          <input
            type="text"
            required
            value={form.code}
            onChange={(event) => updateField("code", event.target.value)}
            placeholder="vd. cod, bank_transfer, vnpay"
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Mô tả ngắn (hiển thị ở Checkout)
        <input
          type="text"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <MediaPicker
        label="Icon / Logo"
        mediaOptions={mediaOptions}
        selectedId={form.iconMediaId}
        onChange={(mediaId) => updateField("iconMediaId", mediaId)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Nhóm
          <select
            value={form.group}
            onChange={(event) => updateField("group", event.target.value as PaymentMethodGroup)}
            className={adminFieldInputClassName}
          >
            {PAYMENT_METHOD_GROUP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {(form.group === "card" || form.group === "e_wallet") && (
          <label className={adminFieldLabelClassName}>
            Gateway / Provider (vd. vnpay, momo, zalopay, stripe)
            <input
              type="text"
              value={form.gateway}
              onChange={(event) => updateField("gateway", event.target.value)}
              className={adminFieldInputClassName}
            />
          </label>
        )}
      </div>

      <label className={adminFieldLabelClassName}>
        Hướng dẫn hiển thị ở Checkout (tùy chọn)
        <textarea
          rows={3}
          value={form.instructions}
          onChange={(event) => updateField("instructions", event.target.value)}
          className={`${adminFieldInputClassName} h-auto py-2.5`}
        />
      </label>

      {form.group === "bank_transfer" && (
        <div className="rounded-lg border border-brand-line p-4">
          <p className="text-[13px] font-bold text-brand-greenDark">Thông tin tài khoản ngân hàng (nếu cần)</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className={adminFieldLabelClassName}>
              Ngân hàng
              <input
                type="text"
                value={form.bankName}
                onChange={(event) => updateField("bankName", event.target.value)}
                className={adminFieldInputClassName}
              />
            </label>

            <label className={adminFieldLabelClassName}>
              Số tài khoản
              <input
                type="text"
                value={form.bankAccountNumber}
                onChange={(event) => updateField("bankAccountNumber", event.target.value)}
                className={adminFieldInputClassName}
              />
            </label>

            <label className={adminFieldLabelClassName}>
              Chủ tài khoản
              <input
                type="text"
                value={form.bankAccountHolder}
                onChange={(event) => updateField("bankAccountHolder", event.target.value)}
                className={adminFieldInputClassName}
              />
            </label>

            <label className={adminFieldLabelClassName}>
              Chi nhánh
              <input
                type="text"
                value={form.bankBranch}
                onChange={(event) => updateField("bankBranch", event.target.value)}
                className={adminFieldInputClassName}
              />
            </label>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={adminFieldLabelClassName}>
          Thứ tự hiển thị
          <input
            type="number"
            value={form.displayOrder}
            onChange={(event) => updateField("displayOrder", Number(event.target.value))}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Giá trị đơn hàng tối thiểu (tùy chọn)
          <input
            type="number"
            value={form.minOrderAmount}
            onChange={(event) => updateField("minOrderAmount", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Giá trị đơn hàng tối đa (tùy chọn)
          <input
            type="number"
            value={form.maxOrderAmount}
            onChange={(event) => updateField("maxOrderAmount", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
            className="size-4 shrink-0 accent-brand-green"
          />
          Bật phương thức này (hiển thị ở Checkout)
        </label>

        <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(event) => updateField("isDefault", event.target.checked)}
            className="size-4 shrink-0 accent-brand-green"
          />
          Đặt làm mặc định
        </label>
      </div>
    </DataEditor>
  );
}
