"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import { useDeliveryMethodEditor } from "../hooks/useDeliveryMethodEditor";
import { DELIVERY_METHOD_TYPE_OPTIONS, type DeliveryMethodType } from "../types/delivery-method.types";

type DeliveryMethodEditorProps = {
  id?: string;
};

export function DeliveryMethodEditor({ id }: DeliveryMethodEditorProps) {
  const { form, updateField, isLoading, isEditMode, handleSave, handleDelete, goToExplore } =
    useDeliveryMethodEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa phương thức giao hàng" : "Thêm phương thức giao hàng"}
      backHref="/admin/settings/delivery-methods"
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
            placeholder="vd. within_5km, pickup"
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

      <label className={adminFieldLabelClassName}>
        Loại
        <select
          value={form.type}
          onChange={(event) => updateField("type", event.target.value as DeliveryMethodType)}
          className={adminFieldInputClassName}
        >
          {DELIVERY_METHOD_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {form.type === "pickup" && (
        <label className={adminFieldLabelClassName}>
          Địa chỉ nhận hàng
          <input
            type="text"
            value={form.pickupAddress}
            onChange={(event) => updateField("pickupAddress", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Phí (VNĐ)
          <input
            type="number"
            value={form.baseFee}
            onChange={(event) => updateField("baseFee", Number(event.target.value))}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Miễn phí khi đơn từ (tùy chọn)
          <input
            type="number"
            value={form.freeShippingThreshold}
            onChange={(event) => updateField("freeShippingThreshold", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={adminFieldLabelClassName}>
          Thời gian tối thiểu (phút)
          <input
            type="number"
            value={form.estimatedMinMinutes}
            onChange={(event) => updateField("estimatedMinMinutes", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Thời gian tối đa (phút)
          <input
            type="number"
            value={form.estimatedMaxMinutes}
            onChange={(event) => updateField("estimatedMaxMinutes", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Thứ tự hiển thị
          <input
            type="number"
            value={form.displayOrder}
            onChange={(event) => updateField("displayOrder", Number(event.target.value))}
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
