"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedCategory } from "@/features/categories";
import type { ManagedMedia } from "@/features/media";
import type { ManagedProduct } from "../types/product.types";
import { listCategories } from "@/features/categories";
import { listMedia } from "@/features/media";
import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "../services/product.service";

export type ProductFormValue = Omit<ManagedProduct, "id">;

const EMPTY_FORM: ProductFormValue = {
  name: "",
  categoryId: "",
  price: 0,
  description: "",
  status: "active",
  mediaIds: [],
};

type UseProductEditorParams = {
  id?: string;
};

export function useProductEditor({ id }: UseProductEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<ProductFormValue>(EMPTY_FORM);
  const [categoryOptions, setCategoryOptions] = useState<ManagedCategory[]>([]);
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    listCategories().then(setCategoryOptions);
    listMedia().then(setMediaOptions);
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getProductById(id).then((product) => {
      if (isCancelled) {
        return;
      }

      if (product) {
        setForm(product);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof ProductFormValue>(
    field: K,
    value: ProductFormValue[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleMedia(mediaId: string) {
    setForm((previous) => {
      const hasMedia = previous.mediaIds.includes(mediaId);

      return {
        ...previous,
        mediaIds: hasMedia
          ? previous.mediaIds.filter((item) => item !== mediaId)
          : [...previous.mediaIds, mediaId],
      };
    });
  }

  async function handleSave() {
    if (isEditMode) {
      await updateProduct(id, form);
    } else {
      await createProduct(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteProduct(id);
    }
  }

  function goToExplore() {
    router.push("/admin/catalog/products");
  }

  return {
    form,
    updateField,
    toggleMedia,
    categoryOptions,
    mediaOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
