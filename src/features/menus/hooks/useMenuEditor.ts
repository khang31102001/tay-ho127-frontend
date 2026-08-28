"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedMenu } from "../types/menu.types";
import {
  createMenu,
  deleteMenu,
  getMenuById,
  updateMenu,
} from "../services/menu.service";

export type MenuFormValue = Omit<ManagedMenu, "id">;

const EMPTY_FORM: MenuFormValue = {
  name: "",
  status: "active",
};

type UseMenuEditorParams = {
  id?: string;
};

export function useMenuEditor({ id }: UseMenuEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<MenuFormValue>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getMenuById(id).then((menu) => {
      if (isCancelled) {
        return;
      }

      if (menu) {
        setForm(menu);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof MenuFormValue>(field: K, value: MenuFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isEditMode) {
      await updateMenu(id, form);
    } else {
      await createMenu(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteMenu(id);
    }
  }

  function goToExplore() {
    router.push("/admin/catalog/menus");
  }

  return {
    form,
    updateField,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
