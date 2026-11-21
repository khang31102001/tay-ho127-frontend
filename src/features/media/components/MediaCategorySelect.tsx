"use client";

import { AdminSelect } from "@/shared/admin/templates/AdminSelect";
import { adminFieldInputClassName, adminFieldLabelClassName } from "@/shared/admin/templates/formFieldClassName";

import { MEDIA_CATEGORIES, type MediaCategoryCode } from "../types/media-category.types";

type MediaCategorySelectProps = {
  value: string | undefined;
  onChange: (code: MediaCategoryCode) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
};

/** Chọn nhóm kho ảnh (nơi media được thêm vào) — dùng ở màn Thêm media và Sửa media. */
export function MediaCategorySelect({ value, onChange, disabled, label = "Nhóm kho ảnh", hint }: MediaCategorySelectProps) {
  return (
    <label className={adminFieldLabelClassName}>
      {label}
      <AdminSelect
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as MediaCategoryCode)}
        className={adminFieldInputClassName}
      >
        {!value && <option value="">Chưa phân nhóm</option>}
        {MEDIA_CATEGORIES.map((category) => (
          <option key={category.code} value={category.code}>
            {category.label}
          </option>
        ))}
      </AdminSelect>
      {hint && <span className="mt-1 block text-[12px] font-normal text-brand-muted">{hint}</span>}
    </label>
  );
}
