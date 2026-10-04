"use client";

import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import type { BranchContact } from "../types/organization.types";

type BranchContactFieldsProps = {
  contact: BranchContact;
  onChange: (contact: BranchContact) => void;
};

type TextKey = Exclude<keyof BranchContact, "openTime" | "closeTime">;

/**
 * Thông tin liên hệ của MỘT chi nhánh: điện thoại, địa chỉ, giờ mở cửa. Đây là nơi website lấy địa chỉ/SĐT/giờ mở cửa khi
 * chi nhánh được đặt làm "chi nhánh chính". Giờ mở/đóng đi cùng nhau (Backend trả 400 nếu chỉ nhập một).
 */
export function BranchContactFields({ contact, onChange }: BranchContactFieldsProps) {
  function setField(key: keyof BranchContact, value: string) {
    onChange({ ...contact, [key]: value === "" ? null : value });
  }

  function textField(key: TextKey, label: string, type: "text" | "tel" | "email" = "text") {
    return (
      <label className={adminFieldLabelClassName}>
        {label}
        <input
          type={type}
          value={contact[key] ?? ""}
          onChange={(event) => setField(key, event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>
    );
  }

  return (
    <fieldset className="space-y-4 rounded-lg border border-brand-line p-4">
      <legend className="px-1 text-[13px] font-bold text-brand-greenDark">Liên hệ & địa chỉ của chi nhánh</legend>

      <div className="grid gap-4 sm:grid-cols-3">
        {textField("phone", "Số điện thoại", "tel")}
        {textField("hotline", "Hotline", "tel")}
        {textField("email", "Email", "email")}
      </div>

      {textField("addressLine", "Địa chỉ (số nhà, đường)")}

      <div className="grid gap-4 sm:grid-cols-3">
        {textField("ward", "Phường / Xã")}
        {textField("district", "Quận / Huyện")}
        {textField("province", "Tỉnh / Thành phố")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Giờ mở cửa
          <input
            type="time"
            value={contact.openTime ?? ""}
            onChange={(event) => setField("openTime", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
        <label className={adminFieldLabelClassName}>
          Giờ đóng cửa
          <input
            type="time"
            value={contact.closeTime ?? ""}
            onChange={(event) => setField("closeTime", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      {textField("businessHoursNote", "Ghi chú giờ hoạt động")}
    </fieldset>
  );
}
