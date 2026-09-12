"use client";

import { useEffect, useState } from "react";

// Đi thẳng vào api/type thay vì qua index.ts (barrel) — barrel còn re-export
// "use client" OrderOptionsExplorer/OrderOptionEditor (Admin UI), import qua
// đó sẽ kéo thêm UI Admin vào bundle JS của site công khai (Mini Cart/Cart
// Page/Checkout đều dùng hook này), giống lý do order.service.ts đi thẳng vào
// product.service.ts thay vì qua barrel features/products. orderOptionApi
// (không phải service trực tiếp) để khi NEXT_PUBLIC_API_MODE=real, Cart tự
// chuyển sang gọi Backend thật mà không cần sửa hook này.
import { orderOptionApi } from "@/features/order-options/api/order-option-api";
import type { ManagedOrderOptionGroup } from "@/features/order-options/types/order-option.types";
import { useCart } from "../context/cart-context";
import {
  buildDefaultSelectionMap,
  buildSelectionMapFromModifiers,
  hasMissingRequiredSelection,
  resolveSelectedModifiers,
  toggleModifierOption,
} from "../utils/modifier-selection";

/**
 * General Order Options (Nước mắm/Rau...) — ÁP DỤNG CHO TOÀN ĐƠN, không gắn
 * CartItem/Product nào. State DUY NHẤT nằm ở CartContext.orderOptionSelections
 * (KHÔNG giữ state cục bộ ở đây) — mọi nơi gọi hook này (Mini Cart, Cart Page,
 * Checkout) luôn tính `selectedOptionIdsByGroup` trực tiếp từ CartContext, nên
 * đổi ở 1 nơi thì nơi còn lại tự re-render đúng giá trị mới ngay lập tức,
 * kể cả khi cả 2 cùng mount một lúc (Mini Cart mở đè lên trang /gio-hang).
 */
export function useOrderOptions() {
  const { orderOptionSelections, setOrderOptionSelections } = useCart();

  const [groups, setGroups] = useState<ManagedOrderOptionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderOptionApi.list().then((result) => {
      setGroups(result);
      setIsLoading(false);

      // Chưa từng chọn gì (giỏ hàng mới/lần đầu) — seed sẵn option isDefault của từng nhóm,
      // giống hành vi cũ của modifier per-item, để khách không phải tự chọn lại cái hiển nhiên.
      if (orderOptionSelections.length === 0) {
        setOrderOptionSelections(resolveSelectedModifiers(result, buildDefaultSelectionMap(result)));
      }
    });
    // Chỉ chạy 1 lần khi mount — cố tình không thêm orderOptionSelections vào deps để tránh seed lại mỗi khi khách vừa tự chọn xong.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedOptionIdsByGroup = buildSelectionMapFromModifiers(orderOptionSelections);

  function handleToggleOption(group: ManagedOrderOptionGroup, optionId: string) {
    const nextSelectedOptionIdsByGroup = toggleModifierOption(selectedOptionIdsByGroup, group, optionId);
    setOrderOptionSelections(resolveSelectedModifiers(groups, nextSelectedOptionIdsByGroup));
  }

  const hasMissingRequiredOption = hasMissingRequiredSelection(groups, selectedOptionIdsByGroup);

  return {
    groups,
    isLoading,
    orderOptionSelections,
    selectedOptionIdsByGroup,
    handleToggleOption,
    hasMissingRequiredOption,
  };
}
