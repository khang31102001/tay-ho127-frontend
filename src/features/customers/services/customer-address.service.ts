import { adminApi } from "@/lib/http/admin-api";

import type { ManagedCustomerAddress } from "../types/customer-address.types";

/**
 * Admin → Địa chỉ khách hàng, gọi Backend /api/v1/customers/{customerId}/addresses.
 * Backend giữ quy tắc "đúng 1 địa chỉ mặc định": địa chỉ đầu tiên luôn là mặc
 * định, xóa địa chỉ mặc định thì tự chọn địa chỉ khác.
 */

/** CustomerAddressResponse của Backend (không có customerId, ghi chú tên addressNote). */
type CustomerAddressDto = {
  id: string;
  receiverName: string;
  phone: string;
  addressLine: string;
  ward: string | null;
  district: string | null;
  province: string | null;
  addressNote: string | null;
  isDefault: boolean;
};

function toManagedAddress(customerId: string, dto: CustomerAddressDto): ManagedCustomerAddress {
  return {
    id: dto.id,
    customerId,
    receiverName: dto.receiverName,
    phone: dto.phone,
    addressLine: dto.addressLine,
    ward: dto.ward ?? undefined,
    district: dto.district ?? undefined,
    province: dto.province ?? undefined,
    note: dto.addressNote ?? undefined,
    isDefault: dto.isDefault,
  };
}

export type CustomerAddressUpsertInput = Omit<ManagedCustomerAddress, "id">;

function toRequestBody(input: CustomerAddressUpsertInput) {
  return {
    receiverName: input.receiverName,
    phone: input.phone,
    addressLine: input.addressLine,
    ward: input.ward || null,
    district: input.district || null,
    province: input.province || null,
    addressNote: input.note || null,
  };
}

const addressesPath = (customerId: string) => `/customers/${customerId}/addresses`;

export async function listAddressesByCustomerId(customerId: string): Promise<ManagedCustomerAddress[]> {
  const addresses = await adminApi.get<CustomerAddressDto[]>(addressesPath(customerId));
  return addresses.map((address) => toManagedAddress(customerId, address));
}

export async function getAddressById(customerId: string, id: string): Promise<ManagedCustomerAddress> {
  return toManagedAddress(customerId, await adminApi.get<CustomerAddressDto>(`${addressesPath(customerId)}/${id}`));
}

export async function createAddress(input: CustomerAddressUpsertInput): Promise<ManagedCustomerAddress> {
  const created = await adminApi.post<CustomerAddressDto>(addressesPath(input.customerId), {
    ...toRequestBody(input),
    isDefault: input.isDefault,
  });
  return toManagedAddress(input.customerId, created);
}

/** Backend tách "đặt mặc định" thành API riêng — gọi thêm khi admin tick mặc định. */
export async function updateAddress(id: string, input: CustomerAddressUpsertInput): Promise<ManagedCustomerAddress> {
  const updated = await adminApi.put<CustomerAddressDto>(`${addressesPath(input.customerId)}/${id}`, toRequestBody(input));
  return input.isDefault && !updated.isDefault ? setDefaultAddress(input.customerId, id) : toManagedAddress(input.customerId, updated);
}

export function deleteAddress(customerId: string, id: string): Promise<void> {
  return adminApi.delete<void>(`${addressesPath(customerId)}/${id}`);
}

export async function setDefaultAddress(customerId: string, addressId: string): Promise<ManagedCustomerAddress> {
  return toManagedAddress(customerId, await adminApi.put<CustomerAddressDto>(`${addressesPath(customerId)}/${addressId}/default`));
}
