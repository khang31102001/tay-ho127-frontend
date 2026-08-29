"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedMedia } from "@/features/media";
import { listMedia } from "@/features/media";

import type { CustomerUpsertInput } from "../services/customer.service";
import { createCustomer, deleteCustomer, getCustomerById, updateCustomer } from "../services/customer.service";

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
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    listMedia().then(setMediaOptions);
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getCustomerById(id).then((customer) => {
      if (isCancelled) {
        return;
      }

      if (customer) {
        const { id: _id, customerCode: code, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = customer;
        setForm(rest);
        setCustomerCode(code);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

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
      email: form.email?.trim() || undefined,
      dateOfBirth: form.dateOfBirth || null,
    };

    if (isEditMode) {
      await updateCustomer(id, payload);
    } else {
      await createCustomer(payload);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteCustomer(id);
    }
  }

  function goToExplore() {
    router.push("/admin/sales/customers");
  }

  return {
    form,
    updateField,
    customerCode,
    mediaOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
