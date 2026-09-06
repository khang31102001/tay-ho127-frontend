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
    listAvailableDeliveryMethods().then((availableDeliveryMethods) => {
      setDeliveryMethods(availableDeliveryMethods);
      setIsLoadingDeliveryMethods(false);
    });
  }, []);

  // Chỉ tự chọn mặc định khi khách chưa từng chọn — không ghi đè lựa chọn cũ khi quay lại Cart.
  useEffect(() => {
    if (isLoadingDeliveryMethods || deliveryMethodId) return;

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
