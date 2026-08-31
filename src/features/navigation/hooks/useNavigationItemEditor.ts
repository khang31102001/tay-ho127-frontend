"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { listPages, type ManagedPage } from "@/features/pages";

import { navigationApi } from "../api/navigation.api";
import type { ManagedNavigationItem, NavigationTargetType } from "../types/navigation.types";

export type NavigationItemFormValue = {
  label: string;
  parentId: string | null;
  targetType: NavigationTargetType;
  targetId: string | null;
  url: string;
  icon: string | null;
  sortOrder: number;
  isVisible: boolean;
  openInNewTab: boolean;
};

const EMPTY_FORM: NavigationItemFormValue = {
  label: "",
  parentId: null,
  targetType: "route",
  targetId: null,
  url: "",
  icon: null,
  sortOrder: 1,
  isVisible: true,
  openInNewTab: false,
};

type UseNavigationItemEditorParams = {
  menuId: string;
  itemId?: string;
};

export function useNavigationItemEditor({ menuId, itemId }: UseNavigationItemEditorParams) {
  const router = useRouter();
  const isEditMode = itemId !== undefined;

  const [form, setForm] = useState<NavigationItemFormValue>(EMPTY_FORM);
  const [siblingItems, setSiblingItems] = useState<ManagedNavigationItem[]>([]);
  const [pages, setPages] = useState<ManagedPage[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    navigationApi.getItemsByMenuId(menuId).then(setSiblingItems);
    listPages().then(setPages);
  }, [menuId]);

  useEffect(() => {
    if (!isEditMode) return;

    let isCancelled = false;

    navigationApi.getItemById(itemId).then((item) => {
      if (isCancelled || !item) return;

      setForm({
        label: item.label,
        parentId: item.parentId,
        targetType: item.targetType,
        targetId: item.targetId ?? null,
        url: item.url ?? "",
        icon: item.icon ?? null,
        sortOrder: item.sortOrder,
        isVisible: item.isVisible,
        openInNewTab: item.openInNewTab ?? false,
      });
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [itemId, isEditMode]);

  function updateField<K extends keyof NavigationItemFormValue>(field: K, value: NavigationItemFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (!form.label.trim()) {
      throw new Error("Nhãn hiển thị (label) không được để trống.");
    }
    if (form.targetType === "page" && !form.targetId) {
      throw new Error("Vui lòng chọn trang CMS (Page).");
    }
    if (form.targetType !== "page" && !form.url.trim()) {
      throw new Error("Vui lòng nhập URL.");
    }

    const payload = {
      menuId,
      parentId: form.parentId,
      label: form.label.trim(),
      targetType: form.targetType,
      targetId: form.targetType === "page" ? form.targetId : null,
      url: form.targetType === "page" ? null : form.url.trim(),
      icon: form.icon,
      sortOrder: form.sortOrder,
      isVisible: form.isVisible,
      openInNewTab: form.openInNewTab,
    };

    if (isEditMode) {
      await navigationApi.updateItem(itemId, payload);
    } else {
      await navigationApi.createItem(menuId, payload);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await navigationApi.deleteItem(itemId);
    }
  }

  function goToTree() {
    router.push(`/admin/settings/navigation/${menuId}/items`);
  }

  // Loại trừ chính nó khỏi danh sách chọn cha — chống trường hợp hiển nhiên
  // nhất (tự chọn chính mình làm cha). Vòng lặp sâu hơn (chọn cháu làm cha)
  // đã có buildNavigationTree() ở utils/navigation-tree.ts chặn không crash.
  const parentOptions = siblingItems.filter((item) => item.id !== itemId);

  return {
    form,
    updateField,
    pages,
    parentOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToTree,
  };
}
