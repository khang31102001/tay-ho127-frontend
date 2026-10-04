/**
 * Module Organization của Backend: Tổ chức → Phòng ban (cây) + CHI NHÁNH (nơi kinh doanh; mã Backend vẫn gọi là "Brand"),
 * và phạm vi phòng ban/chi nhánh của từng người dùng.
 *
 * Phân biệt hai khái niệm hay bị nhầm:
 * - CHI NHÁNH (file này): MỘT điểm kinh doanh — có địa chỉ, số điện thoại, giờ mở cửa riêng; là đơn vị phân quyền (người
 *   dùng được gán vào chi nhánh nào).
 * - THÔNG TIN THƯƠNG HIỆU (features/brand-profile): danh tính CHUNG của cả doanh nghiệp (tên, slogan, logo, pháp lý, MXH).
 * Website ghép hai thứ qua "chi nhánh chính" (isPrimary).
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

/** Cách khách liên hệ MỘT chi nhánh. Giờ mở/đóng dạng "HH:mm" và phải đi cùng nhau (hoặc cùng để trống). */
export type BranchContact = {
  phone: string | null;
  hotline: string | null;
  email: string | null;
  addressLine: string | null;
  ward: string | null;
  district: string | null;
  province: string | null;
  openTime: string | null;
  closeTime: string | null;
  businessHoursNote: string | null;
};

/** Chi nhánh (Backend "Brand"). isPrimary = chi nhánh CHÍNH mà website hiển thị (địa chỉ/SĐT/giờ mở cửa) — chỉ có một. */
export type ManagedBrand = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAtUtc: string;
  isPrimary: boolean;
  contact: BranchContact;
};

export type CreateOrganizationInput = { code: string; name: string };
export type UpdateOrganizationInput = { name: string; isActive: boolean };

export type CreateDepartmentInput = { organizationId: string; code: string; name: string; parentId: string | null };
export type UpdateDepartmentInput = { name: string; isActive: boolean; parentId: string | null };

export type CreateBrandInput = { organizationId: string; code: string; name: string };
export type UpdateBrandInput = { name: string; isActive: boolean; contact: BranchContact; isPrimary: boolean };

/** Phạm vi của người dùng (GET /users/{id}/departments|brands). */
export type UserDepartmentScope = { departmentId: string; departmentCode: string; departmentName: string };
export type UserBrandScope = { brandId: string; brandCode: string; brandName: string };
