import type { EntityStatus } from "@/components/admin/templates/StatusBadge";
import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { Gender, ManagedCustomer } from "../types/customer.types";

/**
 * Admin → Khách hàng, gọi Backend /api/v1/customers (module Customer, quyền
 * customers.*). Không có API xóa — khóa khách hàng bằng trạng thái.
 * (Cầu nối đăng nhập Site vẫn là mock: site-customer-bridge.service.ts.)
 */

/** CustomerProfileResponse của Backend — gender/status là tên enum viết hoa ("Female", "Active"). */
type CustomerDto = {
  id: string;
  customerCode: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarMediaId: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

function toManagedCustomer(dto: CustomerDto): ManagedCustomer {
  return {
    id: dto.id,
    customerCode: dto.customerCode,
    fullName: dto.fullName,
    phone: dto.phone ?? "",
    email: dto.email ?? undefined,
    avatarMediaId: dto.avatarMediaId,
    dateOfBirth: dto.dateOfBirth,
    gender: (dto.gender?.toLowerCase() as Gender | undefined) ?? undefined,
    status: dto.status.toLowerCase() as EntityStatus,
    createdAt: dto.createdAtUtc,
    updatedAt: dto.updatedAtUtc ?? dto.createdAtUtc,
  };
}

export type CustomerUpsertInput = Omit<ManagedCustomer, "id" | "customerCode" | "createdAt" | "updatedAt">;

function toRequestBody(input: CustomerUpsertInput) {
  return {
    fullName: input.fullName,
    phone: input.phone || null,
    email: input.email || null,
    dateOfBirth: input.dateOfBirth || null,
    gender: input.gender ?? null,
    avatarMediaId: input.avatarMediaId || null,
  };
}

export async function listCustomers(): Promise<ManagedCustomer[]> {
  const page = await adminApi.get<PaginatedResult<CustomerDto>>("/customers", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE, sortDirection: "desc" },
  });
  return page.items.map(toManagedCustomer);
}

export async function getCustomerById(id: string): Promise<ManagedCustomer> {
  return toManagedCustomer(await adminApi.get<CustomerDto>(`/customers/${id}`));
}

/** Backend trả 409 nếu số điện thoại/email đã thuộc khách hàng khác. */
export async function createCustomer(input: CustomerUpsertInput): Promise<ManagedCustomer> {
  return toManagedCustomer(await adminApi.post<CustomerDto>("/customers", toRequestBody(input)));
}

export async function updateCustomer(id: string, input: CustomerUpsertInput): Promise<ManagedCustomer> {
  return toManagedCustomer(
    await adminApi.put<CustomerDto>(`/customers/${id}`, { ...toRequestBody(input), isActive: input.status === "active" }),
  );
}
