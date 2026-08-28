import type { ManagedRole } from "../types/role.types";

export const SEED_ROLES: ManagedRole[] = [
  {
    id: "role-admin",
    name: "Quản trị viên",
    description: "Toàn quyền quản trị hệ thống.",
    permissions: ["menu:manage", "user:manage", "role:manage", "order:manage"],
    status: "active",
  },
  {
    id: "role-sales",
    name: "Nhân viên bán hàng",
    description: "Xử lý đơn hàng và thực đơn.",
    permissions: ["menu:manage", "order:manage"],
    status: "active",
  },
  {
    id: "role-warehouse",
    name: "Nhân viên kho",
    description: "Quản lý thực đơn và tồn kho.",
    permissions: ["menu:manage"],
    status: "active",
  },
  {
    id: "role-accountant",
    name: "Kế toán",
    description: "Theo dõi đơn hàng, không chỉnh sửa thực đơn.",
    permissions: ["order:manage"],
    status: "inactive",
  },
];
