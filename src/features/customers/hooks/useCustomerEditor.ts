"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { listMedia } from "@/features/media";
import { useAsyncData } from "@/hooks/useAsyncData";

import type { CustomerUpsertInput } from "../services/customer.service";
import { createCustomer, getCustomerById, updateCustomer } from "../services/customer.service";

export type CustomerFormValue = CustomerUpsertInput;

/** Cùng quy tắc số điện thoại VN đã dùng ở Checkout (useCheckoutForm.ts) — giữ nhất quán 1 chỗ định nghĩa. */
const PHONE_PATTERN = /^(0\d{9}|\+84\d{9})$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM: CustomerFormValue = {
  fullName: "",
  phone: "",
  email: "",
  avatarMediaId: null,
  dateOfBirth: "",
  gender: undefined,
  status: "active",
};

type UseCustomerEditorParams = {
  id?: string;
};

export function useCustomerEditor({ id }: UseCustomerEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<CustomerFormValue>(EMPTY_FORM);
  const [customerCode, setCustomerCode] = useState<string | null>(null);

  const media = useAsyncData(listMedia, [], { fallbackError: "Không thể tải thư viện media." });
  const existing = useAsyncData(() => getCustomerById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải khách hàng.",
  });

  useEffect(() => {
    if (!existing.data) return;
    const { id: _id, customerCode: code, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = existing.data;
    setForm(rest);
    setCustomerCode(code);
  }, [existing.data]);

  function updateField<K extends keyof CustomerFormValue>(field: K, value: CustomerFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function validate(): string | null {
    if (!form.fullName.trim()) {
      return "Vui lòng nhập họ tên khách hàng.";
    }

    if (!PHONE_PATTERN.test(form.phone.trim())) {
      return "Số điện thoại không đúng định dạng.";
    }

    if (form.email && !EMAIL_PATTERN.test(form.email.trim())) {
      return "Email không đúng định dạng.";
    }

    return null;
  }

  async function handleSave() {
    const validationError = validate();

    if (validationError) {
      throw new Error(validationError);
    }

    const payload: CustomerFormValue = {
      ...form,
      phone: form.phone.trim(),
      email: form.email?.trim() || undefined,
      dateOfBirth: form.dateOfBirth || null,
    };

    if (isEditMode) {
      await updateCustomer(id, payload);
    } else {
      await createCustomer(payload);
    }
  }

  function goToExplore() {
    router.push("/admin/sales/customers");
  }

  return {
    form,
    updateField,
    customerCode,
    mediaOptions: media.data ?? [],
    isLoading: existing.isLoading,
    loadError: existing.error,
    isEditMode,
    handleSave,
    goToExplore,
  };
}
