"use client";

import { useState } from "react";
import Link from "next/link";

import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";
import { listMenus } from "@/features/menus";
import { useAsyncData } from "@/hooks/useAsyncData";

import { MenuProductsPicker } from "./MenuProductsPicker";

/**
 * Màn "Liên kết Thực đơn ↔ Sản phẩm": chọn thực đơn rồi gắn/bỏ/sắp xếp cả loạt
 * sản phẩm của nó trong MenuProductsPicker (thay form thêm từng liên kết một).
 */
export function MenuProductsLinker() {
  const [menuId, setMenuId] = useState("");
  const menus = useAsyncData(listMenus, [], { fallbackError: "Không thể tải danh sách thực đơn." });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-black text-brand-greenDark">Liên kết Thực đơn ↔ Sản phẩm</h1>

        <Link
          href="/admin/catalog/menu-products"
          className="text-[13px] font-bold text-brand-muted transition hover:text-brand-greenDark"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <div className="mt-4 rounded-lg border border-brand-line bg-white p-6">
        <label className={adminFieldLabelClassName}>
          Thực đơn
          <select
            value={menuId}
            onChange={(event) => setMenuId(event.target.value)}
            disabled={menus.isLoading}
            className={adminFieldInputClassName}
          >
            <option value="" disabled>
              {menus.isLoading ? "Đang tải..." : "Chọn thực đơn"}
            </option>

            {(menus.data ?? []).map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.name}
              </option>
            ))}
          </select>
        </label>

        {menus.error && <p className="mt-2 text-[13px] font-bold text-red-600">{menus.error}</p>}
      </div>

      {/* key: đổi thực đơn thì tải lại và bỏ các thay đổi chưa lưu của thực đơn trước. */}
      {menuId && <MenuProductsPicker key={menuId} menuId={menuId} />}
    </div>
  );
}
