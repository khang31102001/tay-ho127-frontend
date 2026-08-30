import type { ManagedCustomer } from "../types/customer.types";

/**
 * MOCK CONTRACT: seed tối thiểu cho Phase 02 (Customer Management).
 */
export const SEED_CUSTOMERS: ManagedCustomer[] = [
  {
    id: "customer-1",
    customerCode: "KH00001",
    fullName: "Nguyễn Thị Hoa",
    phone: "0901234567",
    email: "hoa.nguyen@gmail.com",
    avatarMediaId: null,
    dateOfBirth: "1990-05-12",
    gender: "female",
    status: "active",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "customer-2",
    customerCode: "KH00002",
    fullName: "Trần Văn Minh",
    phone: "0912345678",
    email: "minh.tran@gmail.com",
    avatarMediaId: null,
    dateOfBirth: "1985-11-23",
    gender: "male",
    status: "active",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "customer-3",
    customerCode: "KH00003",
    fullName: "Lê Thị Thu",
    phone: "0987654321",
    avatarMediaId: null,
    dateOfBirth: null,
    status: "inactive",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
];
