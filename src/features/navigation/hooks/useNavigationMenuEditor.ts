"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

import { useAsyncData } from "@/hooks/useAsyncData";

import { getMenuById, updateMenu } from "../services/navigation.service";
import { SITE_NAVIGATION_CONTAINERS_PATH } from "../utils/navigation-scope";

export type NavigationMenuFormValue = {
  name: string;
  isActive: boolean;
};

const EMPTY_FORM: NavigationMenuFormValue = { name: "", isActive: true };

/** Sửa container của menu Website: chỉ tên và bật/tắt — mã và vị trí cố định (Site tra cứu menu theo vị trí). */
export function useNavigationMenuEditor({ id }: { id: string }) {
  const router = useNavigationRouter();
  const [form, setForm] = useState<NavigationMenuFormValue>(EMPTY_FORM);

  const menu = useAsyncData(() => getMenuById(id), [id], { fallbackError: "Không thể tải menu." });

  useEffect(() => {
    if (menu.data) setForm({ name: menu.data.name, isActive: menu.data.isActive });
  }, [menu.data]);

  function updateField<K extends keyof NavigationMenuFormValue>(field: K, value: NavigationMenuFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) throw new Error("Tên menu không được để trống.");
    await updateMenu(id, { name: form.name.trim(), isActive: form.isActive });
  }

  function goToExplore() {
    router.push(SITE_NAVIGATION_CONTAINERS_PATH);
  }

  return { form, updateField, menu: menu.data, isLoading: menu.isLoading, loadError: menu.error, handleSave, goToExplore };
}
