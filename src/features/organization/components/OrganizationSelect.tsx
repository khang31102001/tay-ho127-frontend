"use client";

import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";

import type { ManagedOrganization } from "../types/organization.types";

type OrganizationSelectProps = {
  value: string;
  organizations: ManagedOrganization[];
  disabled?: boolean;
  required?: boolean;
  label?: string;
  /** Có giá trị => thêm lựa chọn "không thuộc tổ chức nào" (value ""). */
  emptyOptionLabel?: string;
  onChange: (organizationId: string) => void;
};

/** Ô chọn Tổ chức dùng cho mọi Editor có trường organizationId (Phòng ban, Brand, Năm tài chính, Cài đặt). */
export function OrganizationSelect({
  value,
  organizations,
  disabled = false,
  required = true,
  label = "Tổ chức",
  emptyOptionLabel,
  onChange,
}: OrganizationSelectProps) {
  return (
    <label className={adminFieldLabelClassName}>
      {label}
      <select
        required={required}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${adminFieldInputClassName} disabled:bg-brand-line/30`}
      >
        <option value="" disabled={!emptyOptionLabel}>
          {emptyOptionLabel ?? "Chọn tổ chức"}
        </option>
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
    </label>
  );
}
