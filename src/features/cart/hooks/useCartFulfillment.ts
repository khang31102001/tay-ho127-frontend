"use client";

import { useEffect, useMemo, useState } from "react";

import {
  listAvailableDeliveryMethods,
  resolveDeliveryFee,
  type ManagedDeliveryMethod,
} from "@/features/delivery-methods";
import { useCart } from "../context/cart-context";

function pickDefaultDeliveryMethod(methods: ManagedDeliveryMethod[]): ManagedDeliveryMethod | undefined {
  return methods.find((method) => method.isDefault) ?? methods[0];
}

/**
 * Tải danh sách Delivery Method (Cart Page PHẢI lấy động từ Admin — không
 * hard-code) + tự chọn mặc định lần đầu, đồng thời tính shippingFee hiện tại
 * cho FulfillmentSelector/PriceSummary ở Cart Page. deliveryMethodId/address
 * đọc/ghi thẳng vào CartContext (không phải state cục bộ) để giữ nguyên khi
 * khách sang Checkout tạo Order.
 */
export function useCartFulfillment() {
  const { totalPrice, deliveryMethodId, setDeliveryMethodId, address, setAddress } = useCart();

  const [deliveryMethods, setDeliveryMethods] = useState<ManagedDeliveryMethod[]>([]);
  const [isLoadingDeliveryMethods, setIsLoadingDeliveryMethods] = useState(true);

  useEffect(() => {
    listAvailableDeliveryMethods()
      .then(setDeliveryMethods)
      .catch((error) => {
        // Không tải được: giỏ hàng vẫn hiển thị, chỉ chưa có phương thức giao để chọn (Checkout sẽ báo thiếu).
        console.error("Không thể tải phương thức giao hàng:", error);
      })
      .finally(() => setIsLoadingDeliveryMethods(false));
  }, []);

  // Tự chọn mặc định khi khách chưa từng chọn, hoặc khi lựa chọn đã lưu không còn khả dụng (Admin tắt/xóa, hoặc id cũ từ trước
  // khi chuyển sang Backend) — còn khả dụng thì giữ nguyên, không ghi đè lựa chọn của khách khi quay lại Cart.
  useEffect(() => {
    if (isLoadingDeliveryMethods) return;
    if (deliveryMethods.some((method) => method.id === deliveryMethodId)) return;

    const defaultMethod = pickDefaultDeliveryMethod(deliveryMethods);
    if (defaultMethod) setDeliveryMethodId(defaultMethod.id);
  }, [isLoadingDeliveryMethods, deliveryMethods, deliveryMethodId, setDeliveryMethodId]);

  const selectedDeliveryMethod = useMemo(
    () => deliveryMethods.find((method) => method.id === deliveryMethodId),
    [deliveryMethods, deliveryMethodId],
  );

  const shippingFee = selectedDeliveryMethod ? resolveDeliveryFee(selectedDeliveryMethod, totalPrice) : 0;

  return {
    deliveryMethods,
    isLoadingDeliveryMethods,
    deliveryMethodId,
    setDeliveryMethodId,
    address,
    setAddress,
    selectedDeliveryMethod,
    shippingFee,
  };
}
