/**
 * Modifier là DỮ LIỆU ĐỘNG DO ADMIN QUẢN LÝ (Phase 0 đã chốt) — không hard-code
 * "Nước mắm"/"Rau" trong component. ModifierGroup là entity Admin Catalog độc
 * lập (như Category/Media), được gán vào Product qua `ManagedProduct.modifierGroupIds`
 * (mảng id, cùng pattern với `mediaIds` — không tạo bảng junction riêng vì
 * chưa có nhu cầu field phụ per-assignment như minSelect/maxSelect/sortOrder
 * riêng cho từng Product).
 *
 * Option nhúng trực tiếp trong Group (không tách entity/route CRUD riêng) —
 * Option luôn được tạo/sửa/xóa cùng lúc với Group của nó trong 1 màn hình,
 * không có nhu cầu quản lý độc lập.
 */
export const MODIFIER_SELECTION_TYPE_OPTIONS = [
  { value: "single", label: "Chọn 1 (radio)" },
  { value: "multiple", label: "Chọn nhiều (checkbox)" },
] as const;

export type ModifierSelectionType = (typeof MODIFIER_SELECTION_TYPE_OPTIONS)[number]["value"];

export type ModifierOption = {
  id: string;
  label: string;
  /** Chênh lệch giá so với giá gốc Product — 0 = không đổi giá, có thể âm nếu cần giảm giá theo lựa chọn. */
  priceAdjustment: number;
  /** Chỉ có ý nghĩa khi selectionType = "single" — option nào được chọn sẵn khi mở ModifierSelector. */
  isDefault: boolean;
};

export type ManagedModifierGroup = {
  id: string;
  /** Tên nhóm hiển thị cho khách, vd. "Nước mắm", "Rau". */
  name: string;
  selectionType: ModifierSelectionType;
  /** single + có option isDefault → luôn thỏa required. multiple + isRequired → phải chọn tối thiểu 1 option mới được thêm vào giỏ. */
  isRequired: boolean;
  options: ModifierOption[];
  createdAt: string;
  updatedAt: string;
};
