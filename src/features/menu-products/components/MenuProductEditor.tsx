"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { formatCurrency } from "@/lib/format-currency";

import { useMenuProductEditor } from "../hooks/useMenuProductEditor";

type MenuProductEditorProps = {
  id?: string;
};

export function MenuProductEditor({ id }: MenuProductEditorProps) {
  const {
    form,
    updateField,
    menuOptions,
    productOptions,
    selectedProduct,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useMenuProductEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa liên kết Thực đơn ↔ Sản phẩm" : "Thêm liên kết"}
      backHref="/admin/catalog/menu-products"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Thực đơn
          <select
            required
            value={form.menuId}
            onChange={(event) => updateField("menuId", event.target.value)}
            className={adminFieldInputClassName}
          >
            <option value="" disabled>
              Chọn thực đơn
            </option>

            {menuOptions.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.name}
              </option>
            ))}
          </select>
        </label>

        <label className={adminFieldLabelClassName}>
          Sản phẩm
          <select
            required
            value={form.productId}
            onChange={(event) => updateField("productId", event.target.value)}
            className={adminFieldInputClassName}
          >
            <option value="" disabled>
              Chọn sản phẩm
            </option>

            {productOptions.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Giá riêng (tùy chọn)
        {selectedProduct && (
          <span className="ml-1 font-normal text-brand-muted">
            — để trống dùng giá gốc: {formatCurrency(selectedProduct.price)}
          </span>
        )}
        <input
          type="number"
          min={0}
          value={form.priceOverride ?? ""}
          onChange={(event) =>
            updateField(
              "priceOverride",
              event.target.value === "" ? undefined : Number(event.target.value),
            )
          }
          className={adminFieldInputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Thứ tự hiển thị
          <input
            type="number"
            value={form.sortOrder}
            onChange={(event) => updateField("sortOrder", Number(event.target.value))}
            className={adminFieldInputClassName}
          />
        </label>

        <label className="mt-1.5 flex h-10 items-center gap-2 text-[13px] font-bold text-brand-greenDark">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(event) => updateField("isAvailable", event.target.checked)}
            className="size-4 accent-brand-green"
          />
          Còn hàng (hiển thị cho khách)
        </label>
      </div>
    </DataEditor>
  );
}
