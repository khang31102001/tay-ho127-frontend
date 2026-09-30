"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { listMenus } from "@/features/menus";
import { listProducts } from "@/features/products";
import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedMenuProduct } from "../types/menu-product.types";
import {
  createMenuProduct,
  deleteMenuProduct,
  getMenuProductById,
  updateMenuProduct,
} from "../services/menu-product.service";

export type MenuProductFormValue = Omit<ManagedMenuProduct, "id">;

const EMPTY_FORM: MenuProductFormValue = {
  menuId: "",
  productId: "",
  priceOverride: undefined,
  sortOrder: 0,
  isAvailable: true,
};

type UseMenuProductEditorParams = {
  id?: string;
};

export function useMenuProductEditor({ id }: UseMenuProductEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<MenuProductFormValue>(EMPTY_FORM);

  const options = useAsyncData(() => Promise.all([listMenus(), listProducts()]), [], {
    fallbackError: "Không thể tải thực đơn / sản phẩm.",
  });
  const existing = useAsyncData(() => getMenuProductById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải liên kết.",
  });

  const [menuOptions, productOptions] = options.data ?? [[], []];

  useEffect(() => {
    if (!existing.data) return;
    const { menuId, productId, priceOverride, sortOrder, isAvailable } = existing.data;
    setForm({ menuId, productId, priceOverride, sortOrder, isAvailable });
  }, [existing.data]);

  function updateField<K extends keyof MenuProductFormValue>(
    field: K,
    value: MenuProductFormValue[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  const selectedProduct = productOptions.find((product) => product.id === form.productId);

  async function handleSave() {
    if (isEditMode) {
      await updateMenuProduct(id, form);
    } else {
      await createMenuProduct(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteMenuProduct(id);
    }
  }

  function goToExplore() {
    router.push("/admin/catalog/menu-products");
  }

  return {
    form,
    updateField,
    menuOptions,
    productOptions,
    selectedProduct,
    isLoading: existing.isLoading,
    loadError: existing.error ?? options.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
