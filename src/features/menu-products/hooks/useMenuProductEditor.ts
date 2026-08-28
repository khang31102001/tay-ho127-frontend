"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedMenu } from "@/features/menus";
import type { ManagedMenuProduct } from "../types/menu-product.types";
import type { ManagedProduct } from "@/features/products";
import { listMenus } from "@/features/menus";
import {
  createMenuProduct,
  deleteMenuProduct,
  getMenuProductById,
  updateMenuProduct,
} from "../services/menu-product.service";
import { listProducts } from "@/features/products";

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
  const [menuOptions, setMenuOptions] = useState<ManagedMenu[]>([]);
  const [productOptions, setProductOptions] = useState<ManagedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    listMenus().then(setMenuOptions);
    listProducts().then(setProductOptions);
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getMenuProductById(id).then((item) => {
      if (isCancelled) {
        return;
      }

      if (item) {
        setForm(item);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

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
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
