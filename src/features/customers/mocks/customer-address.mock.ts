import type { ManagedCustomerAddress } from "../types/customer-address.types";

export const SEED_CUSTOMER_ADDRESSES: ManagedCustomerAddress[] = [
  {
    id: "addr-1",
    customerId: "customer-1",
    receiverName: "Nguyễn Thị Hoa",
    phone: "0901234567",
    addressLine: "12 Đinh Tiên Hoàng",
    ward: "Đa Kao",
    district: "Quận 1",
    province: "TP. Hồ Chí Minh",
    isDefault: true,
  },
  {
    id: "addr-2",
    customerId: "customer-1",
    receiverName: "Nguyễn Thị Hoa (Công ty)",
    phone: "0901234567",
    addressLine: "88 Nguyễn Huệ",
    ward: "Bến Nghé",
    district: "Quận 1",
    province: "TP. Hồ Chí Minh",
    isDefault: false,
  },
  {
    id: "addr-3",
    customerId: "customer-2",
    receiverName: "Trần Văn Minh",
    phone: "0912345678",
    addressLine: "45 Lê Lợi",
    ward: "Bến Thành",
    district: "Quận 1",
    province: "TP. Hồ Chí Minh",
    isDefault: true,
  },
];
