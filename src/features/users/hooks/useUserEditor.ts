"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import {
  assignUserBrand,
  assignUserDepartment,
  listBrands,
  listDepartments,
  listUserBrands,
  listUserDepartments,
  removeUserBrand,
  removeUserDepartment,
} from "@/features/organization";
import { listRoles } from "@/features/roles";
import { useAsyncData } from "@/hooks/useAsyncData";

import {
  assignUserRole,
  createUser,
  getUserById,
  listUserRoles,
  removeUserRole,
  resetUserPassword,
  updateUser,
} from "../services/user.service";

export type UserFormValue = {
  fullName: string;
  email: string;
  password: string;
  isActive: boolean;
  roleIds: string[];
  departmentIds: string[];
  brandIds: string[];
};

const EMPTY_FORM: UserFormValue = {
  fullName: "",
  email: "",
  password: "",
  isActive: true,
  roleIds: [],
  departmentIds: [],
  brandIds: [],
};

/** Phần phân quyền admin đang đăng nhập được phép thay đổi (Backend kiểm tra lại). */
export type UserEditorPermissions = {
  canManageRoles: boolean;
  canManageDepartments: boolean;
  canManageBrands: boolean;
};

type ScopeField = "roleIds" | "departmentIds" | "brandIds";

/** Gán thêm các id mới chọn, gỡ các id bỏ chọn — Backend không có API "thay toàn bộ" cho phạm vi user. */
async function syncAssignments(
  current: string[],
  desired: string[],
  assign: (id: string) => Promise<void>,
  remove: (id: string) => Promise<void>,
): Promise<void> {
  await Promise.all([
    ...desired.filter((id) => !current.includes(id)).map(assign),
    ...current.filter((id) => !desired.includes(id)).map(remove),
  ]);
}

export function useUserEditor({ id, permissions }: { id?: string; permissions: UserEditorPermissions }) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<UserFormValue>(EMPTY_FORM);
  const [savedScopes, setSavedScopes] = useState<Pick<UserFormValue, ScopeField>>({ roleIds: [], departmentIds: [], brandIds: [] });

  const options = useAsyncData(() => Promise.all([listRoles(), listDepartments(), listBrands()]), [], {
    fallbackError: "Không thể tải vai trò / phòng ban / brand.",
  });
  const existing = useAsyncData(
    () => Promise.all([getUserById(id ?? ""), listUserRoles(id ?? ""), listUserDepartments(id ?? ""), listUserBrands(id ?? "")]),
    [id],
    { enabled: isEditMode, fallbackError: "Không thể tải người dùng." },
  );

  useEffect(() => {
    if (!existing.data) return;
    const [user, roles, departments, brands] = existing.data;
    const scopes = {
      roleIds: roles.map((role) => role.roleId),
      departmentIds: departments.map((department) => department.departmentId),
      brandIds: brands.map((brand) => brand.brandId),
    };
    setSavedScopes(scopes);
    setForm({ fullName: user.fullName, email: user.email, password: "", isActive: user.isActive, ...scopes });
  }, [existing.data]);

  const [roles = [], departments = [], brands = []] = options.data ?? [];

  function updateField<K extends keyof UserFormValue>(field: K, value: UserFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleScope(field: ScopeField, scopeId: string) {
    setForm((previous) => ({
      ...previous,
      [field]: previous[field].includes(scopeId)
        ? previous[field].filter((item) => item !== scopeId)
        : [...previous[field], scopeId],
    }));
  }

  async function handleSave() {
    const user = isEditMode
      ? await updateUser(id, { fullName: form.fullName, isActive: form.isActive })
      : await createUser({ email: form.email, fullName: form.fullName, password: form.password });

    await Promise.all([
      permissions.canManageRoles &&
        syncAssignments(savedScopes.roleIds, form.roleIds, (roleId) => assignUserRole(user.id, roleId), (roleId) => removeUserRole(user.id, roleId)),
      permissions.canManageDepartments &&
        syncAssignments(
          savedScopes.departmentIds,
          form.departmentIds,
          (departmentId) => assignUserDepartment(user.id, departmentId),
          (departmentId) => removeUserDepartment(user.id, departmentId),
        ),
      permissions.canManageBrands &&
        syncAssignments(savedScopes.brandIds, form.brandIds, (brandId) => assignUserBrand(user.id, brandId), (brandId) => removeUserBrand(user.id, brandId)),
    ]);
  }

  async function handleResetPassword(newPassword: string) {
    if (isEditMode) await resetUserPassword(id, newPassword);
  }

  return {
    form,
    updateField,
    toggleScope,
    roleOptions: roles.map((role) => ({ id: role.id, label: role.name, hint: role.code })),
    departmentOptions: departments.map((department) => ({ id: department.id, label: department.name, hint: department.code })),
    brandOptions: brands.map((brand) => ({ id: brand.id, label: brand.name, hint: brand.code })),
    isLoading: options.isLoading || existing.isLoading,
    loadError: options.error ?? existing.error,
    isEditMode,
    handleSave,
    handleResetPassword,
    goToExplore: () => router.push("/admin/users"),
  };
}
