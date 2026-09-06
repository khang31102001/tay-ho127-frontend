import type { ManagedOrderOptionGroup } from "../types/order-option.types";

/**
 * MOCK CONTRACT: General Order Options cho toàn bộ website — id tách riêng
 * khỏi modifier-groups (modgroup-*) dù nội dung ví dụ giống nhau, vì đây là
 * 2 catalog độc lập (Order Configuration vs Product Modifier) dù cùng chung
 * 1 shape dữ liệu. Khi có Admin Explorer/Editor riêng cho Order Options, chỉ
 * cần sửa CRUD tại service này, Cart/Checkout không cần đổi.
 */
export const SEED_ORDER_OPTIONS: ManagedOrderOptionGroup[] = [
  {
    id: "order-opt-nuoc-mam",
    name: "Nước mắm",
    selectionType: "single",
    isRequired: true,
    options: [
      { id: "order-opt-nuoc-mam-khong-cay", label: "Không cay", priceAdjustment: 0, isDefault: true },
      { id: "order-opt-nuoc-mam-cay", label: "Cay", priceAdjustment: 0, isDefault: false },
      { id: "order-opt-nuoc-mam-cay-nhieu", label: "Cay nhiều", priceAdjustment: 0, isDefault: false },
      { id: "order-opt-nuoc-mam-them", label: "Thêm nước mắm", priceAdjustment: 5_000, isDefault: false },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "order-opt-rau",
    name: "Rau",
    selectionType: "single",
    isRequired: true,
    options: [
      { id: "order-opt-rau-tieu-chuan", label: "Rau tiêu chuẩn", priceAdjustment: 0, isDefault: true },
      { id: "order-opt-rau-them", label: "Thêm rau", priceAdjustment: 5_000, isDefault: false },
      { id: "order-opt-rau-khong", label: "Không rau", priceAdjustment: 0, isDefault: false },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];
