"use client";

import { ActiveStatusField } from "@/components/admin/templates/ActiveStatusField";
import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";

import { BranchContactFields } from "./BranchContactFields";
import { OrganizationSelect } from "./OrganizationSelect";
import { useBrandEditor, useDepartmentEditor, useOrganizationEditor } from "../hooks/useOrganizationEditors";

const codeInputClassName = `${adminFieldInputClassName} font-mono disabled:bg-brand-line/30`;

function CodeNameFields({
  code,
  name,
  isEditMode,
  nameLabel,
  onCodeChange,
  onNameChange,
}: {
  code: string;
  name: string;
  isEditMode: boolean;
  nameLabel: string;
  onCodeChange: (value: string) => void;
  onNameChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={adminFieldLabelClassName}>
        {nameLabel}
        <input type="text" required value={name} onChange={(event) => onNameChange(event.target.value)} className={adminFieldInputClassName} />
      </label>
      <label className={adminFieldLabelClassName}>
        Mã (không đổi được sau khi tạo)
        <input type="text" required disabled={isEditMode} value={code} onChange={(event) => onCodeChange(event.target.value)} className={codeInputClassName} />
      </label>
    </div>
  );
}

export function OrganizationEditor({ id }: { id?: string }) {
  const { form, updateField, isLoading, loadError, isEditMode, handleSave, goToExplore } = useOrganizationEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa tổ chức" : "Thêm tổ chức"}
      backHref="/admin/organization/organizations"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
    >
      <CodeNameFields
        code={form.code}
        name={form.name}
        isEditMode={isEditMode}
        nameLabel="Tên tổ chức"
        onCodeChange={(value) => updateField("code", value)}
        onNameChange={(value) => updateField("name", value)}
      />
      {isEditMode && <ActiveStatusField isActive={form.isActive} onChange={(value) => updateField("isActive", value)} />}
    </DataEditor>
  );
}

export function DepartmentEditor({ id }: { id?: string }) {
  const { form, updateField, organizations, parentOptions, isLoading, loadError, isEditMode, handleSave, goToExplore } =
    useDepartmentEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa phòng ban" : "Thêm phòng ban"}
      backHref="/admin/organization/departments"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
    >
      <CodeNameFields
        code={form.code}
        name={form.name}
        isEditMode={isEditMode}
        nameLabel="Tên phòng ban"
        onCodeChange={(value) => updateField("code", value)}
        onNameChange={(value) => updateField("name", value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <OrganizationSelect
          value={form.organizationId}
          organizations={organizations}
          disabled={isEditMode}
          onChange={(value) => updateField("organizationId", value)}
        />
        <label className={adminFieldLabelClassName}>
          Phòng ban cha
          <select value={form.parentId} onChange={(event) => updateField("parentId", event.target.value)} className={adminFieldInputClassName}>
            <option value="">(Không — phòng ban gốc)</option>
            {parentOptions.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isEditMode && <ActiveStatusField isActive={form.isActive} onChange={(value) => updateField("isActive", value)} />}
    </DataEditor>
  );
}

export function BrandEditor({ id }: { id?: string }) {
  const { form, updateField, organizations, isLoading, loadError, isEditMode, handleSave, goToExplore } = useBrandEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa chi nhánh" : "Thêm chi nhánh"}
      backHref="/admin/organization/brands"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
    >
      <CodeNameFields
        code={form.code}
        name={form.name}
        isEditMode={isEditMode}
        nameLabel="Tên chi nhánh"
        onCodeChange={(value) => updateField("code", value)}
        onNameChange={(value) => updateField("name", value)}
      />
      <OrganizationSelect
        value={form.organizationId}
        organizations={organizations}
        disabled={isEditMode}
        onChange={(value) => updateField("organizationId", value)}
      />
      {isEditMode && (
        <>
          <BranchContactFields contact={form.contact} onChange={(contact) => updateField("contact", contact)} />

          <label className="flex items-start gap-2 text-[13px] font-medium text-brand-ink">
            <input
              type="checkbox"
              checked={form.isPrimary}
              disabled={!form.isActive}
              onChange={(event) => updateField("isPrimary", event.target.checked)}
              className="mt-0.5 size-4 accent-brand-green"
            />
            <span>
              Chi nhánh chính — website hiển thị địa chỉ, số điện thoại và giờ mở cửa của chi nhánh này.
              <span className="block text-[12px] font-normal text-brand-muted">
                Chỉ một chi nhánh được chọn: chọn chi nhánh này sẽ bỏ chọn chi nhánh chính cũ. Chi nhánh ngừng hoạt động không thể là chi nhánh chính.
              </span>
            </span>
          </label>

          <ActiveStatusField isActive={form.isActive} onChange={(value) => updateField("isActive", value)} />
        </>
      )}
    </DataEditor>
  );
}
