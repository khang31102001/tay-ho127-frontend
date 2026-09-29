"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { CustomerAddressUpsertInput } from "../services/customer-address.service";
import { createAddress, deleteAddress, getAddressById, updateAddress } from "../services/customer-address.service";

export type CustomerAddressFormValue = CustomerAddressUpsertInput;

function buildEmptyForm(customerId: string): CustomerAddressFormValue {
  return {
    customerId,
    receiverName: "",
    phone: "",
    addressLine: "",
    ward: "",
    district: "",
    province: "",
    note: "",
    isDefault: false,
  };
}

type UseCustomerAddressEditorParams = {
  customerId: string;
  id?: string;
};

export function useCustomerAddressEditor({ customerId, id }: UseCustomerAddressEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<CustomerAddressFormValue>(buildEmptyForm(customerId));
  const existing = useAsyncData(() => getAddressById(customerId, id ?? ""), [customerId, id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải địa chỉ.",
  });

  useEffect(() => {
    if (!existing.data) return;
    const { id: _addressId, ...rest } = existing.data;
    setForm(rest);
  }, [existing.data]);

  function updateField<K extends keyof CustomerAddressFormValue>(field: K, value: CustomerAddressFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (!form.receiverName.trim() || !form.phone.trim() || !form.addressLine.trim()) {
      throw new Error("Vui lòng nhập đầy đủ tên người nhận, số điện thoại và địa chỉ.");
    }

    if (isEditMode) {
      await updateAddress(id, form);
    } else {
      await createAddress(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteAddress(customerId, id);
    }
  }

  function goToExplore() {
    router.push(`/admin/sales/customers/${customerId}/addresses`);
  }

  return {
    form,
    updateField,
    isLoading: existing.isLoading,
    loadError: existing.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
