"use client";

import { useEffect, useState } from "react";

// Import thẳng service/component/type (không qua barrel @/features/menu) —
// barrel đó không re-export UI admin, nhưng đi thẳng path vẫn giữ nhất quán
// với quy ước toàn repo cho code chạy ở Site.
import { fetchCrossSellProducts } from "@/features/menu/services/menu.service";
import { ProductCard } from "@/features/menu/components/ProductCard";
import type { UiProduct } from "@/features/menu/types/menu.types";
import { useCart } from "../context/cart-context";

/**
 * Section "Có thể bạn muốn dùng thêm" trong Cart Page — dữ liệu lấy động từ
 * Menu "Gợi ý thêm món" (Admin quản lý qua Catalog → Thực đơn/Liên kết
 * Menu-SP), KHÔNG hard-code danh sách món. Tái sử dụng thẳng ProductCard
 * (đã có nút "+" thêm nhanh vào giỏ) thay vì tạo component thêm-vào-giỏ mới.
 */
export function CrossSellProducts() {
  const { cartItems } = useCart();
  const [items, setItems] = useState<UiProduct[] | null>(null);

  useEffect(() => {
    let isCancelled = false;
    fetchCrossSellProducts().then((data) => {
      if (!isCancelled) setItems(data);
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  if (!items || items.length === 0) {
    return null;
  }

  const cartProductIds = new Set(cartItems.map((item) => item.productId));
  const suggestions = items.filter((item) => !cartProductIds.has(item.slug));

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <h2 className="mb-5 text-[18px] font-black text-brand-green">Có thể bạn muốn dùng thêm</h2>

      <div className="grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-4">
        {suggestions.map((item) => (
          <ProductCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}
