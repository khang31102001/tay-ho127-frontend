"use client";

import { useState } from "react";

import { ActiveStatusField } from "@/components/admin/templates/ActiveStatusField";
import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { useAdminAuth } from "@/features/admin-auth";

import { useUserEditor } from "../hooks/useUserEditor";

type ChecklistOption = { id: string; label: string; hint: string };

function ScopeChecklist({
  title,
  options,
  selectedIds,
  disabled,
  onToggle,
}: {
  title: string;
  options: ChecklistOption[];
  selectedIds: string[];
  disabled: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="rounded-lg border border-brand-line px-3 py-2">
      <legend className="px-1 text-[13px] font-bold text-brand-ink">{title}</legend>
      {disabled && <p className="mb-1 text-[12px] text-brand-muted">Bạn không có quyền thay đổi mục này.</p>}
      {options.length === 0 ? (
        <p className="text-[12px] text-brand-muted">Chưa có dữ liệu.</p>
      ) : (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-[13px] font-medium text-brand-ink">
              <input
                type="checkbox"
                disabled={disabled}
                checked={selectedIds.includes(option.id)}
                onChange={() => onToggle(option.id)}
                className="size-4 accent-brand-green"
              />
              {option.label}
              <span className="font-mono text-[11px] text-brand-muted">{option.hint}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

/** Đặt lại mật khẩu — thao tác riêng, không đi qua nút Lưu của form. */
function ResetPasswordPanel({ onReset }: { onReset: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    setStatus(null);
    try {
      await onReset(password);
      setPassword("");
      setStatus({ tone: "success", message: "Đã đặt lại mật khẩu." });
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Không thể đặt lại mật khẩu." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <fieldset className="rounded-lg border border-brand-line px-3 py-3">
      <legend className="px-1 text-[13px] font-bold text-brand-ink">Đặt lại mật khẩu</legend>
      <div className="flex flex-wrap items-end gap-2">
        <label className={`${adminFieldLabelClassName} flex-1`}>
          Mật khẩu mới
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
        <button
          type="button"
          disabled={isSubmitting || !password}
          onClick={submit}
          className="rounded-lg border border-brand-line px-4 py-2.5 text-[13px] font-bold text-brand-greenDark hover:bg-brand-green/5 disabled:opacity-50"
        >
          Đặt lại
        </button>
      </div>
      {status && (
        <p className={`mt-2 text-[12px] ${status.tone === "success" ? "text-brand-greenDark" : "text-red-600"}`}>{status.message}</p>
      )}
    </fieldset>
  );
}

type UserEditorProps = {
  id?: string;
};

export function UserEditor({ id }: UserEditorProps) {
  const { hasPermission } = useAdminAuth();
  const permissions = {
    canManageRoles: hasPermission("users.roles.manage"),
    canManageDepartments: hasPermission("users.departments.manage"),
    canManageBrands: hasPermission("users.brands.manage"),
  };
  const {
    form,
    updateField,
    toggleScope,
    roleOptions,
    departmentOptions,
    brandOptions,
    isLoading,
    loadError,
    isEditMode,
    handleSave,
    handleResetPassword,
    goToExplore,
  } = useUserEditor({ id, permissions });

  return (
    <DataEditor
      title={isEditMode ? "Sửa người dùng" : "Thêm người dùng"}
      backHref="/admin/users"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Họ tên
          <input
            type="text"
            required
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Email đăng nhập
          <input
            type="email"
            required
            disabled={isEditMode}
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={`${adminFieldInputClassName} disabled:bg-brand-line/30`}
          />
        </label>
      </div>

      {isEditMode ? (
        <ActiveStatusField isActive={form.isActive} onChange={(value) => updateField("isActive", value)} inactiveLabel="Khóa tài khoản" />
      ) : (
        <label className={adminFieldLabelClassName}>
          Mật khẩu
          <input
            type="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      )}

      <ScopeChecklist
        title="Vai trò"
        options={roleOptions}
        selectedIds={form.roleIds}
        disabled={!permissions.canManageRoles}
        onToggle={(roleId) => toggleScope("roleIds", roleId)}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <ScopeChecklist
          title="Phòng ban"
          options={departmentOptions}
          selectedIds={form.departmentIds}
          disabled={!permissions.canManageDepartments}
          onToggle={(departmentId) => toggleScope("departmentIds", departmentId)}
        />
        <ScopeChecklist
          title="Brand được làm việc"
          options={brandOptions}
          selectedIds={form.brandIds}
          disabled={!permissions.canManageBrands}
          onToggle={(brandId) => toggleScope("brandIds", brandId)}
        />
      </div>

      {isEditMode && hasPermission("users.reset-password") && <ResetPasswordPanel onReset={handleResetPassword} />}
    </DataEditor>
  );
}
