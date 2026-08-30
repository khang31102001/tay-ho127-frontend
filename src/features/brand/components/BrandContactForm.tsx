import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import type { BrandSettingsFormValue } from "../hooks/useBrandSettingsEditor";

type BrandContactFormProps = {
  form: BrandSettingsFormValue;
  updateField: <K extends keyof BrandSettingsFormValue>(field: K, value: BrandSettingsFormValue[K]) => void;
};

export function BrandContactForm({ form, updateField }: BrandContactFormProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className={adminFieldLabelClassName} htmlFor="brand-phone">
          Số điện thoại
        </label>
        <input
          id="brand-phone"
          type="tel"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          className={adminFieldInputClassName}
        />
      </div>

      <div>
        <label className={adminFieldLabelClassName} htmlFor="brand-hotline">
          Hotline
        </label>
        <input
          id="brand-hotline"
          type="tel"
          value={form.hotline ?? ""}
          onChange={(event) => updateField("hotline", event.target.value)}
          className={adminFieldInputClassName}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={adminFieldLabelClassName} htmlFor="brand-email">
          Email liên hệ
        </label>
        <input
          id="brand-email"
          type="email"
          value={form.email ?? ""}
          onChange={(event) => updateField("email", event.target.value)}
          className={adminFieldInputClassName}
        />
      </div>
    </div>
  );
}
