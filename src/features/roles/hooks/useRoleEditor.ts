"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { listPermissions, type ManagedPermission } from "@/features/permissions";
import { useAsyncData } from "@/hooks/useAsyncData";

import {
  createRole,
  deleteRole,
  getRoleById,
  getRolePermissionIds,
  setRolePermissionIds,
  updateRole,
} from "../services/role.service";

export type RoleFormValue = {
  code: string;
  name: string;
  isActive: boolean;
  permissionIds: string[];
};

const EMPTY_FORM: RoleFormValue = { code: "", name: "", isActive: true, permissionIds: [] };

/** Quyền gom theo domain = phần trước dấu "." cuối của mã (vd. "users.roles.manage" → "users.roles"). */
export type PermissionGroup = { domain: string; permissions: ManagedPermission[] };

function groupPermissionsByDomain(permissions: ManagedPermission[]): PermissionGroup[] {
  const groups = new Map<string, ManagedPermission[]>();
  [...permissions]
    .sort((a, b) => a.code.localeCompare(b.code))
    .forEach((permission) => {
      const separatorIndex = permission.code.lastIndexOf(".");
      const domain = separatorIndex > 0 ? permission.code.slice(0, separatorIndex) : permission.code;
      groups.set(domain, [...(groups.get(domain) ?? []), permission]);
    });
  return [...groups].map(([domain, items]) => ({ domain, permissions: items }));
}

type UseRoleEditorParams = {
  id?: string;
  /** Admin có quyền "roles.permissions.manage" — không có thì lưu vai trò nhưng giữ nguyên quyền hạn. */
  canManagePermissions: boolean;
};

export function useRoleEditor({ id, canManagePermissions }: UseRoleEditorParams) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<RoleFormValue>(EMPTY_FORM);
  const loaded = useAsyncData(
    () =>
      Promise.all([
        listPermissions(),
        id !== undefined ? Promise.all([getRoleById(id), getRolePermissionIds(id)]) : Promise.resolve(null),
      ]),
    [id],
    { fallbackError: "Không thể tải vai trò." },
  );

  useEffect(() => {
    const existing = loaded.data?.[1];
    if (existing) {
      const [role, permissionIds] = existing;
      setForm({ code: role.code, name: role.name, isActive: role.isActive, permissionIds });
    }
  }, [loaded.data]);

  const permissionGroups = useMemo(() => groupPermissionsByDomain(loaded.data?.[0] ?? []), [loaded.data]);

  function updateField<K extends keyof RoleFormValue>(field: K, value: RoleFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function togglePermission(permissionId: string) {
    setForm((previous) => ({
      ...previous,
      permissionIds: previous.permissionIds.includes(permissionId)
        ? previous.permissionIds.filter((item) => item !== permissionId)
        : [...previous.permissionIds, permissionId],
    }));
  }

  async function handleSave() {
    const role = isEditMode
      ? await updateRole(id, { name: form.name, isActive: form.isActive })
      : await createRole({ code: form.code, name: form.name });

    if (canManagePermissions) {
      await setRolePermissionIds(role.id, form.permissionIds);
    }
  }

  async function handleDelete() {
    if (isEditMode) await deleteRole(id);
  }

  function goToExplore() {
    router.push("/admin/roles");
  }

  return {
    form,
    updateField,
    togglePermission,
    permissionGroups,
    isLoading: loaded.isLoading,
    loadError: loaded.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
