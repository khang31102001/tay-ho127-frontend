"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { listPermissions } from "@/features/permissions";
import { useAsyncData } from "@/hooks/useAsyncData";

import {
  createAdminMenu,
  deleteAdminMenu,
  getAdminMenuById,
  getAdminMenuPermissionCodes,
  listAdminMenus,
  setAdminMenuPermissionCodes,
  updateAdminMenu,
} from "../services/admin-menu.service";

export type AdminMenuFormValue = {
  code: string;
  name: string;
  parentId: string;
  route: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  permissionCodes: string[];
};

const EMPTY_FORM: AdminMenuFormValue = {
  code: "",
  name: "",
  parentId: "",
  route: "",
  icon: "",
  sortOrder: 0,
  isActive: true,
  permissionCodes: [],
};

const emptyToNull = (value: string) => (value.trim() ? value.trim() : null);

type UseAdminMenuEditorParams = {
  id?: string;
  /** Có quyền "menus.permissions.manage" — không có thì giữ nguyên quyền gate khi lưu. */
  canManagePermissions: boolean;
};

export function useAdminMenuEditor({ id, canManagePermissions }: UseAdminMenuEditorParams) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<AdminMenuFormValue>(EMPTY_FORM);

  const options = useAsyncData(() => Promise.all([listAdminMenus(), listPermissions()]), [], {
    fallbackError: "Không thể tải dữ liệu menu.",
  });
  const existing = useAsyncData(
    () => Promise.all([getAdminMenuById(id ?? ""), getAdminMenuPermissionCodes(id ?? "")]),
    [id],
    { enabled: isEditMode, fallbackError: "Không thể tải menu." },
  );

  useEffect(() => {
    if (!existing.data) return;
    const [menu, permissionCodes] = existing.data;
    setForm({
      code: menu.code,
      name: menu.name,
      parentId: menu.parentId ?? "",
      route: menu.route ?? "",
      icon: menu.icon ?? "",
      sortOrder: menu.sortOrder,
      isActive: menu.isActive,
      permissionCodes,
    });
  }, [existing.data]);

  // Chỉ menu gốc làm cha được (sidebar hiển thị 2 cấp), và không chọn chính nó.
  const parentOptions = (options.data?.[0] ?? []).filter((menu) => !menu.parentId && menu.id !== id);
  const permissionCodeOptions = (options.data?.[1] ?? []).map((permission) => permission.code).sort();

  function updateField<K extends keyof AdminMenuFormValue>(field: K, value: AdminMenuFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function togglePermissionCode(code: string) {
    setForm((previous) => ({
      ...previous,
      permissionCodes: previous.permissionCodes.includes(code)
        ? previous.permissionCodes.filter((item) => item !== code)
        : [...previous.permissionCodes, code],
    }));
  }

  async function handleSave() {
    const fields = {
      name: form.name,
      parentId: emptyToNull(form.parentId),
      route: emptyToNull(form.route),
      icon: emptyToNull(form.icon),
      sortOrder: form.sortOrder,
    };

    const menu = isEditMode
      ? await updateAdminMenu(id, { ...fields, isActive: form.isActive })
      : await createAdminMenu({ ...fields, code: form.code });

    if (canManagePermissions) {
      await setAdminMenuPermissionCodes(menu.id, form.permissionCodes);
    }
  }

  async function handleDelete() {
    if (isEditMode) await deleteAdminMenu(id);
  }

  function goToExplore() {
    router.push("/admin/system/menus");
  }

  return {
    form,
    updateField,
    togglePermissionCode,
    parentOptions,
    permissionCodeOptions,
    isLoading: options.isLoading || existing.isLoading,
    loadError: options.error ?? existing.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
