"use client";

import { ActiveStatusField } from "@/components/admin/templates/ActiveStatusField";
import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { useAdminAuth } from "@/features/admin-auth";
import { OrganizationSelect } from "@/features/organization";

import { useFiscalYearEditor, useSystemSettingEditor } from "../hooks/usePlatformEditors";

const codeInputClassName = `${adminFieldInputClassName} font-mono disabled:bg-brand-line/30`;

export function FiscalYearEditor({ id }: { id?: string }) {
  const { form, updateField, organizations, isLoading, loadError, isEditMode, handleSave, goToExplore } = useFiscalYearEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa năm tài chính" : "Thêm năm tài chính"}
      backHref="/admin/system/fiscal-years"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Tên
          <input type="text" required placeholder="vd. FY2027" value={form.name} onChange={(event) => updateField("name", event.target.value)} className={adminFieldInputClassName} />
        </label>
        <label className={adminFieldLabelClassName}>
          Mã (không đổi được sau khi tạo)
          <input type="text" required disabled={isEditMode} value={form.code} onChange={(event) => updateField("code", event.target.value)} className={codeInputClassName} />
        </label>
      </div>

      <OrganizationSelect
        value={form.organizationId}
        organizations={organizations}
        disabled={isEditMode}
        onChange={(organizationId) => updateField("organizationId", organizationId)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Ngày bắt đầu
          <input type="date" required value={form.startDate} onChange={(event) => updateField("startDate", event.target.value)} className={adminFieldInputClassName} />
        </label>
        <label className={adminFieldLabelClassName}>
          Ngày kết thúc
          <input
            type="date"
            required
            min={form.startDate || undefined}
            value={form.endDate}
            onChange={(event) => updateField("endDate", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      {isEditMode && <ActiveStatusField isActive={form.isActive} onChange={(value) => updateField("isActive", value)} />}
    </DataEditor>
  );
}

export function SystemSettingEditor({ id }: { id?: string }) {
  const { form, updateField, organizations, isLoading, loadError, isEditMode, handleSave, handleDelete, goToExplore } =
    useSystemSettingEditor({ id });
  const { hasPermission } = useAdminAuth();

  return (
    <DataEditor
      title={isEditMode ? "Sửa cài đặt hệ thống" : "Thêm cài đặt hệ thống"}
      backHref="/admin/system/settings"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode && hasPermission("system-settings.delete") ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Mã (không đổi được sau khi tạo)
          <input type="text" required disabled={isEditMode} placeholder="vd. site.hotline" value={form.code} onChange={(event) => updateField("code", event.target.value)} className={codeInputClassName} />
        </label>
        <label className={adminFieldLabelClassName}>
          Tên hiển thị
          <input type="text" required value={form.name} onChange={(event) => updateField("name", event.target.value)} className={adminFieldInputClassName} />
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Giá trị
        <textarea rows={4} value={form.value} onChange={(event) => updateField("value", event.target.value)} className={adminFieldInputClassName} />
      </label>

      <OrganizationSelect
        label="Phạm vi"
        value={form.organizationId}
        organizations={organizations}
        disabled={isEditMode}
        required={false}
        emptyOptionLabel="Toàn hệ thống"
        onChange={(organizationId) => updateField("organizationId", organizationId)}
      />

      {isEditMode && <ActiveStatusField isActive={form.isActive} onChange={(value) => updateField("isActive", value)} />}
    </DataEditor>
  );
}
