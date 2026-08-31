"use client";

import { useEffect, useState } from "react";

import { navigationApi } from "../api/navigation.api";
import type { NavigationItem, NavigationLocation } from "../types/navigation.types";

/**
 * Site (Client Component: Header/Footer) nhận `initialItems` từ SSR (nhanh,
 * không nháy lần render đầu), sau đó tự fetch lại 1 lần khi mount để đồng bộ
 * với thay đổi Admin vừa lưu.
 *
 * LÝ DO CẦN HÀM NÀY: mock hiện dùng localStorage — Server Component
 * (app/(site)/layout.tsx) chạy trên Node process, KHÔNG đọc được localStorage
 * của trình duyệt, nên chỉ SSR không đủ để chứng minh luồng "Admin sửa →
 * User Site cập nhật ngay trong cùng session" (yêu cầu bắt buộc của task).
 * Refetch client-side là cách duy nhất khả thi ở giai đoạn mock.
 *
 * KHI CÓ BACKEND THẬT: server đọc thẳng DB, SSR luôn thấy dữ liệu mới nhất —
 * bước refetch này lúc đó chỉ còn là tối ưu revalidate thông thường (có thể
 * bỏ, hoặc giữ lại để tự làm mới nếu Admin sửa khi User đang mở tab), không
 * còn là điều kiện bắt buộc để đúng dữ liệu.
 */
export function useLiveNavigation(location: NavigationLocation, initialItems: NavigationItem[]): NavigationItem[] {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    let isCancelled = false;

    navigationApi.getByLocation(location).then((menu) => {
      if (!isCancelled && menu) {
        setItems(menu.items);
      }
    });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return items;
}
