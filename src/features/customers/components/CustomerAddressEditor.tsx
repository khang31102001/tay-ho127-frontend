"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";

import { useCustomerAddressEditor } from "../hooks/useCustomerAddressEditor";

type CustomerAddressEditorProps = {
  customerId: string;
  id?: string;
};

export function CustomerAddressEditor({ customerId, id }: CustomerAddressEditorProps) {
  const { form, updateField, isLoading, isEditMode, handleSave, handleDelete, goToExplore } =
    useCustomerAddressEditor({ customerId, id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa địa chỉ" : "Thêm địa chỉ"}
      backHref={`/admin/sales/customers/${customerId}/addresses`}
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Tên người nhận
          <input
            type="text"
            required
            value={form.receiverName}
            onChange={(event) => updateField("receiverName", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Số điện thoại
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Địa chỉ (số nhà, tên đường)
        <input
          type="text"
          required
          value={form.addressLine}
          onChange={(event) => updateField("addressLine", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={adminFieldLabelClassName}>
          Phường/Xã (tùy chọn)
          <input
            type="text"
            value={form.ward ?? ""}
            onChange={(event) => updateField("ward", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Quận/Huyện (tùy chọn)
          <input
            type="text"
            value={form.district ?? ""}
            onChange={(event) => updateField("district", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Tỉnh/Thành phố (tùy chọn)
          <input
            type="text"
            value={form.province ?? ""}
            onChange={(event) => updateField("province", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Ghi chú (tùy chọn)
        <input
          type="text"
          value={form.note ?? ""}
          onChange={(event) => updateField("note", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(event) => updateField("isDefault", event.target.checked)}
          className="size-4 shrink-0 accent-brand-green"
        />
        Đặt làm địa chỉ mặc định
      </label>
    </DataEditor>
  );
}
