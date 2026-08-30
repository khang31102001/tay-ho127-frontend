import type { ManagedCustomerAddress } from "../types/customer-address.types";
import { SEED_CUSTOMER_ADDRESSES } from "../mocks/customer-address.mock";

/**
 * MOCK CONTRACT: chưa có backend quản lý địa chỉ khách hàng thật. Dữ liệu
 * seed (xem ../mocks/customer-address.mock.ts) + đồng bộ 2 chiều với
 * localStorage.
 */
const STORAGE_KEY = "tayho-admin-customer-addresses";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedCustomerAddress[] {
  if (typeof window === "undefined") {
    return SEED_CUSTOMER_ADDRESSES;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedCustomerAddress[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu địa chỉ khách hàng admin:", error);
  }

  return SEED_CUSTOMER_ADDRESSES;
}

function writeStore(addresses: ManagedCustomerAddress[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch (error) {
    console.error("Không thể lưu dữ liệu địa chỉ khách hàng admin:", error);
  }
}

export async function listAddressesByCustomerId(
  customerId: string,
): Promise<ManagedCustomerAddress[]> {
  await delay();
  return readStore().filter((address) => address.customerId === customerId);
}

export async function getAddressById(id: string): Promise<ManagedCustomerAddress | null> {
  await delay();
  return readStore().find((address) => address.id === id) ?? null;
}

export type CustomerAddressUpsertInput = Omit<ManagedCustomerAddress, "id">;

/** Nếu payload.isDefault=true, tự bỏ mặc định ở các địa chỉ khác cùng khách hàng. */
function applyDefaultExclusivity(
  addresses: ManagedCustomerAddress[],
  customerId: string,
  keepDefaultId: string | null,
): ManagedCustomerAddress[] {
  return addresses.map((address) =>
    address.customerId === customerId && address.id !== keepDefaultId
      ? { ...address, isDefault: false }
      : address,
  );
}

export async function createAddress(
  payload: CustomerAddressUpsertInput,
): Promise<ManagedCustomerAddress> {
  await delay();

  const newAddress: ManagedCustomerAddress = { ...payload, id: `addr-${Date.now()}` };

  let next = [...readStore(), newAddress];

  if (newAddress.isDefault) {
    next = applyDefaultExclusivity(next, newAddress.customerId, newAddress.id);
  }

  writeStore(next);

  return newAddress;
}

export async function updateAddress(
  id: string,
  payload: CustomerAddressUpsertInput,
): Promise<ManagedCustomerAddress> {
  await delay();

  const updatedAddress: ManagedCustomerAddress = { ...payload, id };

  let next = readStore().map((address) => (address.id === id ? updatedAddress : address));

  if (updatedAddress.isDefault) {
    next = applyDefaultExclusivity(next, updatedAddress.customerId, id);
  }

  writeStore(next);

  return updatedAddress;
}

export async function deleteAddress(id: string): Promise<void> {
  await delay();

  writeStore(readStore().filter((address) => address.id !== id));
}

export async function setDefaultAddress(customerId: string, addressId: string): Promise<void> {
  await delay();

  const updated = readStore().map((address) =>
    address.customerId === customerId
      ? { ...address, isDefault: address.id === addressId }
      : address,
  );

  writeStore(updated);
}
