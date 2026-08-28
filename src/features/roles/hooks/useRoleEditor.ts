"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedRole } from "../types/role.types";
import {
  createRole,
  deleteRole,
  getRoleById,
  updateRole,
} from "../services/role.service";

export type RoleFormValue = Omit<ManagedRole, "id">;

const EMPTY_FORM: RoleFormValue = {
  name: "",
  description: "",
  permissions: [],
  status: "active",
};

type UseRoleEditorParams = {
  id?: string;
};

export function useRoleEditor({ id }: UseRoleEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<RoleFormValue>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getRoleById(id).then((role) => {
      if (isCancelled) {
        return;
      }

      if (role) {
        setForm(role);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof RoleFormValue>(field: K, value: RoleFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function togglePermission(permission: RoleFormValue["permissions"][number]) {
    setForm((previous) => {
      const hasPermission = previous.permissions.includes(permission);

      return {
        ...previous,
        permissions: hasPermission
          ? previous.permissions.filter((item) => item !== permission)
          : [...previous.permissions, permission],
      };
    });
  }

  async function handleSave() {
    if (isEditMode) {
      await updateRole(id, form);
    } else {
      await createRole(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteRole(id);
    }
  }

  function goToExplore() {
    router.push("/admin/roles");
  }

  return {
    form,
    updateField,
    togglePermission,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
