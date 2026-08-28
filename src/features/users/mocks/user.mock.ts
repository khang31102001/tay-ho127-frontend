import type { ManagedUser } from "../types/user.types";

export const SEED_USERS: ManagedUser[] = [
  {
    id: "user-001",
    fullName: "Nguyễn Văn An",
    email: "an.nguyen@tayho127.vn",
    phone: "0901234567",
    role: "Quản trị viên",
    status: "active",
    createdAt: "2026-01-12",
  },
  {
    id: "user-002",
    fullName: "Trần Thị Bích",
    email: "bich.tran@tayho127.vn",
    phone: "0902345678",
    role: "Nhân viên bán hàng",
    status: "active",
    createdAt: "2026-02-03",
  },
  {
    id: "user-003",
    fullName: "Lê Hoàng Cường",
    email: "cuong.le@tayho127.vn",
    phone: "0903456789",
    role: "Nhân viên kho",
    status: "active",
    createdAt: "2026-03-20",
  },
  {
    id: "user-004",
    fullName: "Phạm Thị Dung",
    email: "dung.pham@tayho127.vn",
    role: "Kế toán",
    status: "inactive",
    createdAt: "2026-04-08",
  },
];
