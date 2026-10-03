"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { useAsyncData } from "@/hooks/useAsyncData";

import {
  createPermission,
  deletePermission,
  getPermissionById,
  updatePermission,
} from "../services/permission.service";

export type PermissionFormValue = {
  code: string;
  name: string;
  isActive: boolean;
};

const EMPTY_FORM: PermissionFormValue = { code: "", name: "", isActive: true };

export function usePermissionEditor({ id }: { id?: string }) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<PermissionFormValue>(EMPTY_FORM);
  const existing = useAsyncData(() => getPermissionById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải quyền.",
  });

  useEffect(() => {
    if (existing.data) {
      const { code, name, isActive } = existing.data;
      setForm({ code, name, isActive });
    }
  }, [existing.data]);

  function updateField<K extends keyof PermissionFormValue>(field: K, value: PermissionFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isEditMode) {
      await updatePermission(id, { name: form.name, isActive: form.isActive });
    } else {
      await createPermission({ code: form.code, name: form.name });
    }
  }

  async function handleDelete() {
    if (isEditMode) await deletePermission(id);
  }

  function goToExplore() {
    router.push("/admin/permissions");
  }

  return {
    form,
    updateField,
    isLoading: existing.isLoading,
    loadError: existing.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
