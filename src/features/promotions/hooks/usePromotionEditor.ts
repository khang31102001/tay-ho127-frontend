"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedCategory } from "@/features/categories";
import type { ManagedProduct } from "@/features/products";
import { listCategories } from "@/features/categories";
import { listProducts } from "@/features/products";

import { promotionApi } from "../api/promotion-api";
import type { PromotionFormValue } from "../services/promotion.service";

const EMPTY_FORM: PromotionFormValue = {
  code: "",
  name: "",
  description: "",
  type: "percentage",
  value: 0,
  maxDiscountAmount: undefined,
  minimumOrderAmount: undefined,
  startAt: undefined,
  endAt: undefined,
  usageLimit: undefined,
  applicableProductIds: [],
  applicableCategoryIds: [],
  status: "active",
};

type UsePromotionEditorParams = {
  id?: string;
};

export function usePromotionEditor({ id }: UsePromotionEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<PromotionFormValue>(EMPTY_FORM);
  const [productOptions, setProductOptions] = useState<ManagedProduct[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ManagedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    listProducts().then(setProductOptions);
    listCategories().then(setCategoryOptions);
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    promotionApi.getById(id).then((promotion) => {
      if (isCancelled) {
        return;
      }

      if (promotion) {
        setForm(promotion);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof PromotionFormValue>(field: K, value: PromotionFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleApplicableProduct(productId: string) {
    setForm((previous) => {
      const current = previous.applicableProductIds ?? [];
      const hasProduct = current.includes(productId);

      return {
        ...previous,
        applicableProductIds: hasProduct ? current.filter((item) => item !== productId) : [...current, productId],
      };
    });
  }

  function toggleApplicableCategory(categoryId: string) {
    setForm((previous) => {
      const current = previous.applicableCategoryIds ?? [];
      const hasCategory = current.includes(categoryId);

      return {
        ...previous,
        applicableCategoryIds: hasCategory
          ? current.filter((item) => item !== categoryId)
          : [...current, categoryId],
      };
    });
  }

  async function handleSave() {
    const normalizedForm: PromotionFormValue = { ...form, code: form.code.trim().toUpperCase() };

    if (!normalizedForm.code) {
      throw new Error("Vui lòng nhập mã giảm giá.");
    }

    if (isEditMode) {
      await promotionApi.update(id, normalizedForm);
    } else {
      await promotionApi.create(normalizedForm);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await promotionApi.delete(id);
    }
  }

  function goToExplore() {
    router.push("/admin/catalog/promotions");
  }

  return {
    form,
    updateField,
    toggleApplicableProduct,
    toggleApplicableCategory,
    productOptions,
    categoryOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
