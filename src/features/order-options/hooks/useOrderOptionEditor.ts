"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ModifierOption, ModifierSelectionType } from "@/features/modifier-groups/types/modifier-group.types";

import { orderOptionApi } from "../api/order-option-api";

export type OrderOptionGroupFormValue = {
  name: string;
  selectionType: ModifierSelectionType;
  isRequired: boolean;
  options: ModifierOption[];
};

const EMPTY_FORM: OrderOptionGroupFormValue = {
  name: "",
  selectionType: "single",
  isRequired: true,
  options: [],
};

function createEmptyOption(): ModifierOption {
  return {
    id: `orderopt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    priceAdjustment: 0,
    isDefault: false,
  };
}

type UseOrderOptionEditorParams = {
  id?: string;
};

export function useOrderOptionEditor({ id }: UseOrderOptionEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<OrderOptionGroupFormValue>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;

    let isCancelled = false;

    orderOptionApi.getById(id).then((group) => {
      if (isCancelled || !group) return;

      setForm({
        name: group.name,
        selectionType: group.selectionType,
        isRequired: group.isRequired,
        options: group.options,
      });
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof OrderOptionGroupFormValue>(field: K, value: OrderOptionGroupFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function addOption() {
    setForm((previous) => ({ ...previous, options: [...previous.options, createEmptyOption()] }));
  }

  function updateOption<K extends keyof ModifierOption>(optionId: string, field: K, value: ModifierOption[K]) {
    setForm((previous) => ({
      ...previous,
      options: previous.options.map((option) => {
        if (option.id !== optionId) {
          // selectionType "single" chỉ được phép 1 option isDefault — bỏ default ở các option còn lại.
          return field === "isDefault" && value === true && previous.selectionType === "single"
            ? { ...option, isDefault: false }
            : option;
        }
        return { ...option, [field]: value };
      }),
    }));
  }

  function removeOption(optionId: string) {
    setForm((previous) => ({ ...previous, options: previous.options.filter((option) => option.id !== optionId) }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      throw new Error("Tên nhóm không được để trống.");
    }
    if (form.options.length === 0) {
      throw new Error("Nhóm phải có ít nhất 1 lựa chọn.");
    }
    if (form.options.some((option) => !option.label.trim())) {
      throw new Error("Tên lựa chọn không được để trống.");
    }

    const payload = {
      name: form.name.trim(),
      selectionType: form.selectionType,
      isRequired: form.isRequired,
      options: form.options.map((option) => ({ ...option, label: option.label.trim() })),
    };

    if (isEditMode) {
      await orderOptionApi.update(id, payload);
    } else {
      await orderOptionApi.create(payload);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await orderOptionApi.delete(id);
    }
  }

  function goToExplore() {
    router.push("/admin/settings/order-options");
  }

  return {
    form,
    updateField,
    addOption,
    updateOption,
    removeOption,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
