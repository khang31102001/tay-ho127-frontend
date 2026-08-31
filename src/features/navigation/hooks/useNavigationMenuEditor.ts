"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { navigationApi } from "../api/navigation.api";
import type { NavigationLocation } from "../types/navigation.types";

export type NavigationMenuFormValue = {
  code: string;
  name: string;
  location: NavigationLocation;
  isActive: boolean;
};

const EMPTY_FORM: NavigationMenuFormValue = {
  code: "",
  name: "",
  location: "header",
  isActive: true,
};

type UseNavigationMenuEditorParams = {
  id?: string;
};

export function useNavigationMenuEditor({ id }: UseNavigationMenuEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<NavigationMenuFormValue>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;

    let isCancelled = false;

    navigationApi.getById(id).then((menu) => {
      if (isCancelled || !menu) return;

      setForm({ code: menu.code, name: menu.name, location: menu.location, isActive: menu.isActive });
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof NavigationMenuFormValue>(field: K, value: NavigationMenuFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (!form.code.trim()) {
      throw new Error("Mã menu (code) không được để trống.");
    }
    if (!form.name.trim()) {
      throw new Error("Tên menu không được để trống.");
    }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      location: form.location,
      isActive: form.isActive,
    };

    if (isEditMode) {
      await navigationApi.updateMenu(id, payload);
    } else {
      await navigationApi.createMenu(payload);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await navigationApi.deleteMenu(id);
    }
  }

  function goToExplore() {
    router.push("/admin/settings/navigation");
  }

  return { form, updateField, isLoading, isEditMode, handleSave, handleDelete, goToExplore };
}
