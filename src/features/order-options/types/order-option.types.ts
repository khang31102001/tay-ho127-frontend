import type { ManagedModifierGroup, ModifierOption } from "@/features/modifier-groups/types/modifier-group.types";

/**
 * "General Order Options" = cấu hình áp dụng cho TOÀN BỘ đơn hàng (vd. Nước
 * mắm, Rau đi kèm...) — KHÁC modifier của features/modifier-groups (gắn với
 * 1 Product cụ thể qua ManagedProduct.modifierGroupIds). Domain riêng vì đây
 * là dữ liệu Order Configuration, không thuộc về Product nào — Cart/Checkout
 * chỉ lấy danh sách này để hiển thị + lưu lựa chọn của khách, không tự định
 * nghĩa option.
 *
 * Dùng lại nguyên shape ManagedModifierGroup/ModifierOption (id/name/
 * selectionType/isRequired/options/priceAdjustment) vì đây vốn là 1 kiểu dữ
 * liệu tổng quát "nhóm lựa chọn" — không có gì đặc thù Product trong bản thân
 * type, nên không tạo type song song. `ModifierGroupSelector` (features/cart)
 * dùng chung được luôn, không cần biết nhóm đến từ Product hay từ Order.
 */
export type ManagedOrderOptionGroup = ManagedModifierGroup;
export type OrderOptionValue = ModifierOption;
