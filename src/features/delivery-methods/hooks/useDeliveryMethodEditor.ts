"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createDeliveryMethod,
  deleteDeliveryMethod,
  getDeliveryMethodById,
  updateDeliveryMethod,
} from "../services/delivery-method.service";
import type { DeliveryMethodType } from "../types/delivery-method.types";

export type DeliveryMethodFormValue = {
  code: string;
  name: string;
  description: string;
  type: DeliveryMethodType;
  baseFee: number;
  freeShippingThreshold: string;
  estimatedMinMinutes: string;
  estimatedMaxMinutes: string;
  pickupAddress: string;
  displayOrder: number;
  isActive: boolean;
  isDefault: boolean;
};

const EMPTY_FORM: DeliveryMethodFormValue = {
  code: "",
  name: "",
  description: "",
  type: "delivery",
  baseFee: 0,
  freeShippingThreshold: "",
  estimatedMinMinutes: "",
  estimatedMaxMinutes: "",
  pickupAddress: "",
  displayOrder: 1,
  isActive: true,
  isDefault: false,
};

type UseDeliveryMethodEditorParams = {
  id?: string;
};

export function useDeliveryMethodEditor({ id }: UseDeliveryMethodEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<DeliveryMethodFormValue>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;

    let isCancelled = false;

    getDeliveryMethodById(id).then((method) => {
      if (isCancelled || !method) return;

      setForm({
        code: method.code,
        name: method.name,
        description: method.description ?? "",
        type: method.type,
        baseFee: method.baseFee,
        freeShippingThreshold: method.freeShippingThreshold?.toString() ?? "",
        estimatedMinMinutes: method.estimatedMinMinutes?.toString() ?? "",
        estimatedMaxMinutes: method.estimatedMaxMinutes?.toString() ?? "",
        pickupAddress: method.pickupAddress ?? "",
        displayOrder: method.displayOrder,
        isActive: method.isActive,
        isDefault: method.isDefault,
      });
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof DeliveryMethodFormValue>(field: K, value: DeliveryMethodFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (!form.code.trim()) {
      throw new Error("Mã phương thức (code) không được để trống.");
    }
    if (!form.name.trim()) {
      throw new Error("Tên phương thức không được để trống.");
    }
    if (form.type === "pickup" && !form.pickupAddress.trim()) {
      throw new Error("Vui lòng nhập địa chỉ nhận hàng cho phương thức tự đến lấy.");
    }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description || undefined,
      type: form.type,
      baseFee: form.baseFee,
      freeShippingThreshold: form.freeShippingThreshold ? Number(form.freeShippingThreshold) : undefined,
      estimatedMinMinutes: form.estimatedMinMinutes ? Number(form.estimatedMinMinutes) : undefined,
      estimatedMaxMinutes: form.estimatedMaxMinutes ? Number(form.estimatedMaxMinutes) : undefined,
      pickupAddress: form.type === "pickup" ? form.pickupAddress || undefined : undefined,
      displayOrder: form.displayOrder,
      isActive: form.isActive,
      isDefault: form.isDefault,
    };

    if (isEditMode) {
      await updateDeliveryMethod(id, payload);
    } else {
      await createDeliveryMethod(payload);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteDeliveryMethod(id);
    }
  }

  function goToExplore() {
    router.push("/admin/settings/delivery-methods");
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
