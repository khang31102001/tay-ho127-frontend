/**
 * Module Organization của Backend: Tổ chức → Phòng ban (cây) + Brand (chi
 * nhánh/thương hiệu kinh doanh), và phạm vi phòng ban/brand của từng người dùng.
 * KHÁC features/brand (Cài đặt thương hiệu hiển thị trên Site).
 */

export type ManagedOrganization = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAtUtc: string;
};

export type ManagedDepartment = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  isActive: boolean;
  parentId: string | null;
  createdAtUtc: string;
};

export type ManagedBrand = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAtUtc: string;
};

export type CreateOrganizationInput = { code: string; name: string };
export type UpdateOrganizationInput = { name: string; isActive: boolean };

export type CreateDepartmentInput = { organizationId: string; code: string; name: string; parentId: string | null };
export type UpdateDepartmentInput = { name: string; isActive: boolean; parentId: string | null };

export type CreateBrandInput = { organizationId: string; code: string; name: string };
export type UpdateBrandInput = { name: string; isActive: boolean };

/** Phạm vi của người dùng (GET /users/{id}/departments|brands). */
export type UserDepartmentScope = { departmentId: string; departmentCode: string; departmentName: string };
export type UserBrandScope = { brandId: string; brandCode: string; brandName: string };
