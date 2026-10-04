"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { applyLeafSelection, getPermissionTree } from "@/features/permissions";
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
        getPermissionTree(),
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

  const permissionTree = loaded.data?.[0] ?? [];

  function updateField<K extends keyof RoleFormValue>(field: K, value: RoleFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  /** Tick/bỏ tick một quyền lá, hoặc cả nhóm (mọi quyền lá con cháu). Chỉ id quyền lá được lưu. */
  function toggleLeaves(leafIds: string[], checked: boolean) {
    setForm((previous) => ({
      ...previous,
      permissionIds: applyLeafSelection(previous.permissionIds, leafIds, checked),
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
    toggleLeaves,
    permissionTree,
    isLoading: loaded.isLoading,
    loadError: loaded.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
