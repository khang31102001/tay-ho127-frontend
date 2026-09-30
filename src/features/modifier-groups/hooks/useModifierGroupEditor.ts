"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAsyncData } from "@/hooks/useAsyncData";

import {
  createModifierGroup,
  deleteModifierGroup,
  getModifierGroupById,
  NEW_OPTION_ID_PREFIX,
  updateModifierGroup,
} from "../services/modifier-group.service";
import type { ModifierOption, ModifierSelectionType } from "../types/modifier-group.types";

export type ModifierGroupFormValue = {
  name: string;
  selectionType: ModifierSelectionType;
  isRequired: boolean;
  options: ModifierOption[];
};

const EMPTY_FORM: ModifierGroupFormValue = {
  name: "",
  selectionType: "single",
  isRequired: true,
  options: [],
};

function createEmptyOption(): ModifierOption {
  return {
    // Id tạm chỉ để làm React key — service gửi id = null cho Backend cấp id thật.
    id: `${NEW_OPTION_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    priceAdjustment: 0,
    isDefault: false,
  };
}

type UseModifierGroupEditorParams = {
  id?: string;
};

export function useModifierGroupEditor({ id }: UseModifierGroupEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<ModifierGroupFormValue>(EMPTY_FORM);

  const existing = useAsyncData(() => getModifierGroupById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải nhóm tùy chọn món.",
  });

  useEffect(() => {
    if (!existing.data) return;
    const { name, selectionType, isRequired, options } = existing.data;
    setForm({ name, selectionType, isRequired, options });
  }, [existing.data]);

  function updateField<K extends keyof ModifierGroupFormValue>(field: K, value: ModifierGroupFormValue[K]) {
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
      await updateModifierGroup(id, payload);
    } else {
      await createModifierGroup(payload);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteModifierGroup(id);
    }
  }

  function goToExplore() {
    router.push("/admin/catalog/modifier-groups");
  }

  return {
    form,
    updateField,
    addOption,
    updateOption,
    removeOption,
    isLoading: existing.isLoading,
    loadError: existing.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
