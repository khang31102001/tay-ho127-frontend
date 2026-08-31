"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedMedia } from "@/features/media";
import { listMedia } from "@/features/media";

import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethodById,
  updatePaymentMethod,
} from "../services/payment-method.service";
import type { PaymentMethodGroup } from "../types/payment-method.types";

export type PaymentMethodFormValue = {
  code: string;
  name: string;
  description: string;
  iconMediaId: string | null;
  group: PaymentMethodGroup;
  gateway: string;
  instructions: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  bankBranch: string;
  displayOrder: number;
  isActive: boolean;
  isDefault: boolean;
  minOrderAmount: string;
  maxOrderAmount: string;
};

const EMPTY_FORM: PaymentMethodFormValue = {
  code: "",
  name: "",
  description: "",
  iconMediaId: null,
  group: "cod",
  gateway: "",
  instructions: "",
  bankName: "",
  bankAccountNumber: "",
  bankAccountHolder: "",
  bankBranch: "",
  displayOrder: 1,
  isActive: true,
  isDefault: false,
  minOrderAmount: "",
  maxOrderAmount: "",
};

type UsePaymentMethodEditorParams = {
  id?: string;
};

export function usePaymentMethodEditor({ id }: UsePaymentMethodEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<PaymentMethodFormValue>(EMPTY_FORM);
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    listMedia().then(setMediaOptions);
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    let isCancelled = false;

    getPaymentMethodById(id).then((method) => {
      if (isCancelled || !method) return;

      setForm({
        code: method.code,
        name: method.name,
        description: method.description ?? "",
        iconMediaId: method.iconMediaId,
        group: method.group,
        gateway: method.gateway ?? "",
        instructions: method.instructions ?? "",
        bankName: method.bankName ?? "",
        bankAccountNumber: method.bankAccountNumber ?? "",
        bankAccountHolder: method.bankAccountHolder ?? "",
        bankBranch: method.bankBranch ?? "",
        displayOrder: method.displayOrder,
        isActive: method.isActive,
        isDefault: method.isDefault,
        minOrderAmount: method.minOrderAmount?.toString() ?? "",
        maxOrderAmount: method.maxOrderAmount?.toString() ?? "",
      });
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof PaymentMethodFormValue>(field: K, value: PaymentMethodFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (!form.code.trim()) {
      throw new Error("Mã phương thức (code) không được để trống.");
    }
    if (!form.name.trim()) {
      throw new Error("Tên phương thức không được để trống.");
    }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description || undefined,
      iconMediaId: form.iconMediaId,
      group: form.group,
      gateway: form.group === "card" || form.group === "e_wallet" ? form.gateway || undefined : undefined,
      instructions: form.instructions || undefined,
      bankName: form.group === "bank_transfer" ? form.bankName || undefined : undefined,
      bankAccountNumber: form.group === "bank_transfer" ? form.bankAccountNumber || undefined : undefined,
      bankAccountHolder: form.group === "bank_transfer" ? form.bankAccountHolder || undefined : undefined,
      bankBranch: form.group === "bank_transfer" ? form.bankBranch || undefined : undefined,
      displayOrder: form.displayOrder,
      isActive: form.isActive,
      isDefault: form.isDefault,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
      maxOrderAmount: form.maxOrderAmount ? Number(form.maxOrderAmount) : undefined,
    };

    if (isEditMode) {
      await updatePaymentMethod(id, payload);
    } else {
      await createPaymentMethod(payload);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deletePaymentMethod(id);
    }
  }

  function goToExplore() {
    router.push("/admin/settings/payment-methods");
  }

  return {
    form,
    updateField,
    mediaOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
