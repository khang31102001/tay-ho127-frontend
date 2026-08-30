import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import type { BrandSettingsFormValue } from "../hooks/useBrandSettingsEditor";

type BrandGeneralFormProps = {
  form: BrandSettingsFormValue;
  updateField: <K extends keyof BrandSettingsFormValue>(field: K, value: BrandSettingsFormValue[K]) => void;
};

export function BrandGeneralForm({ form, updateField }: BrandGeneralFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={adminFieldLabelClassName} htmlFor="brand-name">
          Tên thương hiệu
        </label>
        <input
          id="brand-name"
          type="text"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={adminFieldInputClassName}
        />
      </div>

      <div>
        <label className={adminFieldLabelClassName} htmlFor="brand-tagline">
          Slogan / Tagline
        </label>
        <input
          id="brand-tagline"
          type="text"
          value={form.tagline}
          onChange={(event) => updateField("tagline", event.target.value)}
          className={adminFieldInputClassName}
        />
      </div>

      <div>
        <label className={adminFieldLabelClassName} htmlFor="brand-description">
          Mô tả
        </label>
        <textarea
          id="brand-description"
          rows={4}
          value={form.description ?? ""}
          onChange={(event) => updateField("description", event.target.value)}
          className={`${adminFieldInputClassName} h-auto py-2.5`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-brand-line pt-4 sm:grid-cols-2">
        <div>
          <label className={adminFieldLabelClassName} htmlFor="brand-tax-code">
            Mã số thuế
          </label>
          <input
            id="brand-tax-code"
            type="text"
            value={form.taxCode ?? ""}
            onChange={(event) => updateField("taxCode", event.target.value)}
            className={adminFieldInputClassName}
          />
        </div>

        <div>
          <label className={adminFieldLabelClassName} htmlFor="brand-legal-name">
            Tên pháp lý (đăng ký kinh doanh)
          </label>
          <input
            id="brand-legal-name"
            type="text"
            value={form.legalName ?? ""}
            onChange={(event) => updateField("legalName", event.target.value)}
            className={adminFieldInputClassName}
          />
        </div>
      </div>
    </div>
  );
}
