import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";
import { isApiError } from "@/lib/http/api-error";
import { salesApi } from "@/lib/http/sales-api";

import type { ManagedPaymentMethod, PaymentMethodGroup } from "../types/payment-method.types";

/**
 * Phương thức thanh toán — Backend module Sales (/api/v1/sales/payment-methods, quyền payment-methods.*).
 *
 * - Admin (Cấu hình → Phương thức thanh toán) gọi qua `adminApi`.
 * - Site (Checkout) đọc danh sách ĐANG BẬT qua `salesApi` (/public/payment-methods, không cần đăng nhập). Endpoint công
 *   khai KHÔNG trả tên cổng thanh toán và thông tin tài khoản ngân hàng: khách chỉ thấy số tài khoản bên trong phiên
 *   thanh toán của chính họ.
 * - `code` bất biến sau khi tạo. Nhóm "cod" thanh toán khi nhận hàng (đặt đơn trực tiếp); các nhóm còn lại thanh toán
 *   trước qua phiên thanh toán và do nhân viên xác nhận đã nhận tiền (features/payment).
 */

/** PaymentMethodResponse của Backend. */
type PaymentMethodDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  iconMediaId: string | null;
  group: PaymentMethodGroup;
  gateway: string | null;
  instructions: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  bankBranch: string | null;
  displayOrder: number;
  isActive: boolean;
  isDefault: boolean;
  minOrderAmount: number | null;
  maxOrderAmount: number | null;
  createdAt: string;
  updatedAt: string;
};

/** PublicPaymentMethodResponse của Backend — chỉ phương thức đang bật, không có gateway/ngân hàng/dấu thời gian. */
type PublicPaymentMethodDto = Pick<
  PaymentMethodDto,
  | "id"
  | "code"
  | "name"
  | "description"
  | "iconMediaId"
  | "group"
  | "instructions"
  | "displayOrder"
  | "isDefault"
  | "minOrderAmount"
  | "maxOrderAmount"
>;

function toManagedPaymentMethod(dto: PaymentMethodDto | PublicPaymentMethodDto): ManagedPaymentMethod {
  const full = "gateway" in dto ? dto : undefined;

  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description ?? undefined,
    iconMediaId: dto.iconMediaId,
    group: dto.group,
    gateway: full?.gateway ?? undefined,
    instructions: dto.instructions ?? undefined,
    bankName: full?.bankName ?? undefined,
    bankAccountNumber: full?.bankAccountNumber ?? undefined,
    bankAccountHolder: full?.bankAccountHolder ?? undefined,
    bankBranch: full?.bankBranch ?? undefined,
    displayOrder: dto.displayOrder,
    isActive: full ? full.isActive : true,
    isDefault: dto.isDefault,
    minOrderAmount: dto.minOrderAmount ?? undefined,
    maxOrderAmount: dto.maxOrderAmount ?? undefined,
    createdAt: full ? full.createdAt : "",
    updatedAt: full ? full.updatedAt : "",
  };
}

export async function listPaymentMethods(): Promise<ManagedPaymentMethod[]> {
  const page = await adminApi.get<PaginatedResult<PaymentMethodDto>>("/sales/payment-methods", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedPaymentMethod);
}

/** null khi không tồn tại (Backend 404). */
export async function getPaymentMethodById(id: string): Promise<ManagedPaymentMethod | null> {
  try {
    return toManagedPaymentMethod(await adminApi.get<PaymentMethodDto>(`/sales/payment-methods/${id}`));
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

/**
 * Đơn hàng có nằm trong khoảng minOrderAmount/maxOrderAmount của phương thức không — dùng để GỢI Ý ở Checkout; Backend kiểm
 * tra lại và chặn thật khi tạo đơn.
 */
export function isPaymentMethodEligible(method: ManagedPaymentMethod, subtotal: number): boolean {
  if (method.minOrderAmount !== undefined && subtotal < method.minOrderAmount) {
    return false;
  }
  if (method.maxOrderAmount !== undefined && subtotal > method.maxOrderAmount) {
    return false;
  }
  return true;
}

/** Phương thức đang bật theo thứ tự hiển thị — Checkout PHẢI gọi hàm này, không hard-code phương thức trong UI. */
export async function listAvailablePaymentMethods(): Promise<ManagedPaymentMethod[]> {
  const methods = await salesApi.get<PublicPaymentMethodDto[]>("/public/payment-methods");
  return methods.map(toManagedPaymentMethod);
}

export type PaymentMethodUpsertInput = Omit<ManagedPaymentMethod, "id" | "createdAt" | "updatedAt">;

export async function createPaymentMethod(payload: PaymentMethodUpsertInput): Promise<ManagedPaymentMethod> {
  return toManagedPaymentMethod(await adminApi.post<PaymentMethodDto>("/sales/payment-methods", payload));
}

/** `code` trong payload bị Backend bỏ qua (bất biến). */
export async function updatePaymentMethod(id: string, payload: PaymentMethodUpsertInput): Promise<ManagedPaymentMethod> {
  return toManagedPaymentMethod(await adminApi.put<PaymentMethodDto>(`/sales/payment-methods/${id}`, payload));
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await adminApi.delete(`/sales/payment-methods/${id}`);
}
