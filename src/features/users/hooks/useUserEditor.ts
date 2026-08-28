"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedUser } from "../types/user.types";
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from "../services/user.service";
import { listRoles } from "@/features/roles";

export type UserFormValue = Omit<ManagedUser, "id">;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyForm(): UserFormValue {
  return {
    fullName: "",
    email: "",
    phone: "",
    role: "",
    status: "active",
    createdAt: todayIsoDate(),
  };
}

type UseUserEditorParams = {
  id?: string;
};

export function useUserEditor({ id }: UseUserEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<UserFormValue>(createEmptyForm);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    listRoles().then((roles) => {
      setRoleOptions(roles.map((role) => role.name));
    });
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getUserById(id).then((user) => {
      if (isCancelled) {
        return;
      }

      if (user) {
        setForm(user);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof UserFormValue>(field: K, value: UserFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isEditMode) {
      await updateUser(id, form);
    } else {
      await createUser(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteUser(id);
    }
  }

  function goToExplore() {
    router.push("/admin/users");
  }

  return {
    form,
    updateField,
    roleOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
