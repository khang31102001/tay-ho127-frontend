"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import { getCustomerById } from "../services/customer.service";
import type { ManagedCustomerAddress } from "../types/customer-address.types";
import { deleteAddress, listAddressesByCustomerId, setDefaultAddress } from "../services/customer-address.service";

type UseCustomerAddressesExplorerParams = {
  customerId: string;
};

export function useCustomerAddressesExplorer({ customerId }: UseCustomerAddressesExplorerParams) {
  const { data, isLoading, error, reload } = useAsyncData(
    () => Promise.all([listAddressesByCustomerId(customerId), getCustomerById(customerId)]),
    [customerId],
    { fallbackError: "Không thể tải địa chỉ khách hàng." },
  );

  async function handleDelete(address: ManagedCustomerAddress) {
    await deleteAddress(customerId, address.id);
    await reload();
  }

  async function handleSetDefault(address: ManagedCustomerAddress) {
    await setDefaultAddress(customerId, address.id);
    await reload();
  }

  return {
    rows: data?.[0] ?? [],
    customerName: data?.[1].fullName ?? "",
    isLoading,
    loadError: error,
    handleDelete,
    handleSetDefault,
  };
}
