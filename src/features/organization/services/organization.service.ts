import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type {
  BranchContact,
  CreateBrandInput,
  CreateDepartmentInput,
  CreateOrganizationInput,
  ManagedBrand,
  ManagedDepartment,
  ManagedOrganization,
  UpdateBrandInput,
  UpdateDepartmentInput,
  UpdateOrganizationInput,
  UserBrandScope,
  UserDepartmentScope,
} from "../types/organization.types";

/** Backend module Organization. Không có API xóa — ngừng hoạt động bằng isActive = false. */

const listParams = { params: { pageSize: ADMIN_LIST_PAGE_SIZE } };

// ---- Tổ chức: /api/v1/organizations ----

export async function listOrganizations(): Promise<ManagedOrganization[]> {
  return (await adminApi.get<PaginatedResult<ManagedOrganization>>("/organizations", listParams)).items;
}

export function getOrganizationById(id: string): Promise<ManagedOrganization> {
  return adminApi.get<ManagedOrganization>(`/organizations/${id}`);
}

export function createOrganization(input: CreateOrganizationInput): Promise<ManagedOrganization> {
  return adminApi.post<ManagedOrganization, CreateOrganizationInput>("/organizations", input);
}

export function updateOrganization(id: string, input: UpdateOrganizationInput): Promise<ManagedOrganization> {
  return adminApi.put<ManagedOrganization, UpdateOrganizationInput>(`/organizations/${id}`, input);
}

// ---- Phòng ban: /api/v1/departments ----

export async function listDepartments(): Promise<ManagedDepartment[]> {
  return (await adminApi.get<PaginatedResult<ManagedDepartment>>("/departments", listParams)).items;
}

export function getDepartmentById(id: string): Promise<ManagedDepartment> {
  return adminApi.get<ManagedDepartment>(`/departments/${id}`);
}

export function createDepartment(input: CreateDepartmentInput): Promise<ManagedDepartment> {
  return adminApi.post<ManagedDepartment, CreateDepartmentInput>("/departments", input);
}

/** Backend trả 400 nếu phòng ban cha khác tổ chức hoặc tạo vòng lặp. */
export function updateDepartment(id: string, input: UpdateDepartmentInput): Promise<ManagedDepartment> {
  return adminApi.put<ManagedDepartment, UpdateDepartmentInput>(`/departments/${id}`, input);
}

// ---- Brand: /api/v1/brands ----

const EMPTY_BRANCH_CONTACT: BranchContact = {
  phone: null,
  hotline: null,
  email: null,
  addressLine: null,
  ward: null,
  district: null,
  province: null,
  openTime: null,
  closeTime: null,
  businessHoursNote: null,
};

/** Backend cũ (chưa có liên hệ chi nhánh) không trả `contact`/`isPrimary` — điền mặc định để UI không vỡ. */
function normalizeBrand(brand: ManagedBrand): ManagedBrand {
  return {
    ...brand,
    isPrimary: brand.isPrimary ?? false,
    contact: { ...EMPTY_BRANCH_CONTACT, ...brand.contact },
  };
}

export async function listBrands(): Promise<ManagedBrand[]> {
  return (await adminApi.get<PaginatedResult<ManagedBrand>>("/brands", listParams)).items.map(normalizeBrand);
}

export async function getBrandById(id: string): Promise<ManagedBrand> {
  return normalizeBrand(await adminApi.get<ManagedBrand>(`/brands/${id}`));
}

export async function createBrand(input: CreateBrandInput): Promise<ManagedBrand> {
  return normalizeBrand(await adminApi.post<ManagedBrand, CreateBrandInput>("/brands", input));
}

export async function updateBrand(id: string, input: UpdateBrandInput): Promise<ManagedBrand> {
  return normalizeBrand(await adminApi.put<ManagedBrand, UpdateBrandInput>(`/brands/${id}`, input));
}

// ---- Phạm vi người dùng: /api/v1/users/{userId}/departments|brands ----

export function listUserDepartments(userId: string): Promise<UserDepartmentScope[]> {
  return adminApi.get<UserDepartmentScope[]>(`/users/${userId}/departments`);
}

export function assignUserDepartment(userId: string, departmentId: string): Promise<void> {
  return adminApi.post<void, { departmentId: string }>(`/users/${userId}/departments`, { departmentId });
}

export function removeUserDepartment(userId: string, departmentId: string): Promise<void> {
  return adminApi.delete<void>(`/users/${userId}/departments/${departmentId}`);
}

export function listUserBrands(userId: string): Promise<UserBrandScope[]> {
  return adminApi.get<UserBrandScope[]>(`/users/${userId}/brands`);
}

export function assignUserBrand(userId: string, brandId: string): Promise<void> {
  return adminApi.post<void, { brandId: string }>(`/users/${userId}/brands`, { brandId });
}

export function removeUserBrand(userId: string, brandId: string): Promise<void> {
  return adminApi.delete<void>(`/users/${userId}/brands/${brandId}`);
}
