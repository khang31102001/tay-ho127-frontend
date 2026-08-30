import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

export const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]["value"];

/**
 * Khách hàng do Admin quản lý (đã mua hoặc từng tương tác) — khác
 * `AuthUser` (định danh đăng nhập Site, features/auth) và `ManagedUser`
 * (nhân viên vận hành Admin, features/users). 3 domain độc lập, không ép
 * chung 1 bảng vì trách nhiệm khác nhau.
 *
 * Không lưu classification (NEW/VIP/...) hay số liệu thống kê (tổng đơn,
 * AOV...) làm field trên entity này — tính động từ Order tại màn Detail
 * khi Order tồn tại (Phase 03), tránh dữ liệu lệch với thực tế.
 */
export type ManagedCustomer = {
  id: string;
  /** Mã khách hàng hiển thị, tự sinh dạng KH00001 — xem customer.service.ts. */
  customerCode: string;
  fullName: string;
  phone: string;
  email?: string;
  /** Tham chiếu ManagedMedia.id, chọn từ Media Library. */
  avatarMediaId?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
};
