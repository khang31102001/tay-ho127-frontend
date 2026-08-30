import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import type { BrandSettingsFormValue } from "../hooks/useBrandSettingsEditor";

type BrandAddressFormProps = {
  form: BrandSettingsFormValue;
  updateField: <K extends keyof BrandSettingsFormValue>(field: K, value: BrandSettingsFormValue[K]) => void;
};

export function BrandAddressForm({ form, updateField }: BrandAddressFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={adminFieldLabelClassName} htmlFor="brand-address-line">
          Địa chỉ (số nhà, đường)
        </label>
        <input
          id="brand-address-line"
          type="text"
          value={form.addressLine}
          onChange={(event) => updateField("addressLine", event.target.value)}
          className={adminFieldInputClassName}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={adminFieldLabelClassName} htmlFor="brand-ward">
            Phường/Xã
          </label>
          <input
            id="brand-ward"
            type="text"
            value={form.ward ?? ""}
            onChange={(event) => updateField("ward", event.target.value)}
            className={adminFieldInputClassName}
          />
        </div>

        <div>
          <label className={adminFieldLabelClassName} htmlFor="brand-district">
            Quận/Huyện
          </label>
          <input
            id="brand-district"
            type="text"
            value={form.district ?? ""}
            onChange={(event) => updateField("district", event.target.value)}
            className={adminFieldInputClassName}
          />
        </div>

        <div>
          <label className={adminFieldLabelClassName} htmlFor="brand-province">
            Tỉnh/Thành phố
          </label>
          <input
            id="brand-province"
            type="text"
            value={form.province ?? ""}
            onChange={(event) => updateField("province", event.target.value)}
            className={adminFieldInputClassName}
          />
        </div>
      </div>
    </div>
  );
}
