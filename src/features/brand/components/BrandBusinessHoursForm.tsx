import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import type { BrandSettingsFormValue } from "../hooks/useBrandSettingsEditor";

type BrandBusinessHoursFormProps = {
  form: BrandSettingsFormValue;
  updateField: <K extends keyof BrandSettingsFormValue>(field: K, value: BrandSettingsFormValue[K]) => void;
};

/**
 * 1 khung giờ áp dụng cho mọi ngày (khớp dữ liệu hiện tại) — không dùng mảng
 * BusinessHours theo từng thứ vì business hiện chưa cần lịch riêng theo ngày.
 */
export function BrandBusinessHoursForm({ form, updateField }: BrandBusinessHoursFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={adminFieldLabelClassName} htmlFor="brand-open-time">
            Giờ mở cửa
          </label>
          <input
            id="brand-open-time"
            type="time"
            value={form.openTime}
            onChange={(event) => updateField("openTime", event.target.value)}
            className={adminFieldInputClassName}
          />
        </div>

        <div>
          <label className={adminFieldLabelClassName} htmlFor="brand-close-time">
            Giờ đóng cửa
          </label>
          <input
            id="brand-close-time"
            type="time"
            value={form.closeTime}
            onChange={(event) => updateField("closeTime", event.target.value)}
            className={adminFieldInputClassName}
          />
        </div>
      </div>

      <div>
        <label className={adminFieldLabelClassName} htmlFor="brand-hours-note">
          Ghi chú
        </label>
        <input
          id="brand-hours-note"
          type="text"
          value={form.businessHoursNote ?? ""}
          onChange={(event) => updateField("businessHoursNote", event.target.value)}
          placeholder="Ví dụ: Mở cửa tất cả các ngày trong tuần."
          className={adminFieldInputClassName}
        />
      </div>
    </div>
  );
}
