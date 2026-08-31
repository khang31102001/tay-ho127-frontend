import type { ManagedModifierGroup } from "../types/modifier-group.types";

/**
 * MOCK CONTRACT: 2 nhóm khớp ví dụ trong yêu cầu nghiệp vụ (Nước mắm/Rau),
 * gán sẵn vào "Bánh cuốn nhân thịt đặc biệt" (product-bc002, xem product.mock.ts)
 * để minh họa ModifierSelector.
 */
export const SEED_MODIFIER_GROUPS: ManagedModifierGroup[] = [
  {
    id: "modgroup-nuoc-mam",
    name: "Nước mắm",
    selectionType: "single",
    isRequired: true,
    options: [
      { id: "modopt-nuoc-mam-khong-cay", label: "Không cay", priceAdjustment: 0, isDefault: false },
      { id: "modopt-nuoc-mam-cay", label: "Cay", priceAdjustment: 0, isDefault: true },
      { id: "modopt-nuoc-mam-cay-nhieu", label: "Cay nhiều", priceAdjustment: 0, isDefault: false },
      { id: "modopt-nuoc-mam-them", label: "Thêm nước mắm", priceAdjustment: 5_000, isDefault: false },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "modgroup-rau",
    name: "Rau",
    selectionType: "single",
    isRequired: true,
    options: [
      { id: "modopt-rau-tieu-chuan", label: "Rau tiêu chuẩn", priceAdjustment: 0, isDefault: true },
      { id: "modopt-rau-them", label: "Thêm rau", priceAdjustment: 5_000, isDefault: false },
      { id: "modopt-rau-khong", label: "Không rau", priceAdjustment: 0, isDefault: false },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];
