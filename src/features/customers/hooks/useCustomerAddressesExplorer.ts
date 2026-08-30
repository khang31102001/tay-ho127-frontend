"use client";

import { useCallback, useEffect, useState } from "react";

import { getCustomerById } from "../services/customer.service";
import type { ManagedCustomerAddress } from "../types/customer-address.types";
import {
  deleteAddress,
  listAddressesByCustomerId,
  setDefaultAddress,
} from "../services/customer-address.service";

type UseCustomerAddressesExplorerParams = {
  customerId: string;
};

export function useCustomerAddressesExplorer({ customerId }: UseCustomerAddressesExplorerParams) {
  const [addresses, setAddresses] = useState<ManagedCustomerAddress[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);

    try {
      const [addressData, customer] = await Promise.all([
        listAddressesByCustomerId(customerId),
        getCustomerById(customerId),
      ]);

      setAddresses(addressData);
      setCustomerName(customer?.fullName ?? "");
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  async function handleDelete(address: ManagedCustomerAddress) {
    await deleteAddress(address.id);
    await loadAddresses();
  }

  async function handleSetDefault(address: ManagedCustomerAddress) {
    await setDefaultAddress(customerId, address.id);
    await loadAddresses();
  }

  return {
    rows: addresses,
    customerName,
    isLoading,
    handleDelete,
    handleSetDefault,
  };
}
