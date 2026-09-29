"use client";

import { ActiveStatusField } from "@/components/admin/templates/ActiveStatusField";
import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";

import type { ManagedOrganization } from "../types/organization.types";
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

function OrganizationSelect({
  value,
  organizations,
  disabled,
  onChange,
}: {
  value: string;
  organizations: ManagedOrganization[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={adminFieldLabelClassName}>
      Tổ chức
      <select required disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className={`${adminFieldInputClassName} disabled:bg-brand-line/30`}>
        <option value="" disabled>
          Chọn tổ chức
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
      title={isEditMode ? "Sửa brand" : "Thêm brand"}
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
        nameLabel="Tên brand"
        onCodeChange={(value) => updateField("code", value)}
        onNameChange={(value) => updateField("name", value)}
      />
      <OrganizationSelect
        value={form.organizationId}
        organizations={organizations}
        disabled={isEditMode}
        onChange={(value) => updateField("organizationId", value)}
      />
      {isEditMode && <ActiveStatusField isActive={form.isActive} onChange={(value) => updateField("isActive", value)} />}
    </DataEditor>
  );
}
