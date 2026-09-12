"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";

import { usePromotionEditor } from "../hooks/usePromotionEditor";
import type { PromotionStatus, PromotionType } from "../types/promotion.types";

type PromotionEditorProps = {
  id?: string;
};

function toDateInputValue(value?: string): string {
  return value ? value.slice(0, 10) : "";
}

function fromDateInputValue(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

function toOptionalNumber(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}

export function PromotionEditor({ id }: PromotionEditorProps) {
  const {
    form,
    updateField,
    toggleApplicableProduct,
    toggleApplicableCategory,
    productOptions,
    categoryOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = usePromotionEditor({ id });

  const isProductScoped = form.type === "product_discount";

  return (
    <DataEditor
      title={isEditMode ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
      backHref="/admin/catalog/promotions"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Tên chương trình
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Mã giảm giá
          <input
            type="text"
            required
            value={form.code}
            onChange={(event) => updateField("code", event.target.value.toUpperCase())}
            placeholder="VD: WELCOME20"
            className={`${adminFieldInputClassName} uppercase`}
          />
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Mô tả (tùy chọn)
        <textarea
          value={form.description ?? ""}
          onChange={(event) => updateField("description", event.target.value)}
          rows={2}
          className={`${adminFieldInputClassName} h-auto resize-none py-2`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={adminFieldLabelClassName}>
          Loại giảm giá
          <select
            value={form.type}
            onChange={(event) => updateField("type", event.target.value as PromotionType)}
            className={adminFieldInputClassName}
          >
            <option value="percentage">Giảm theo %</option>
            <option value="fixed_amount">Giảm số tiền cố định</option>
            <option value="free_shipping">Miễn phí vận chuyển</option>
            <option value="product_discount">Giảm giá sản phẩm/danh mục</option>
          </select>
        </label>

        <label className={adminFieldLabelClassName}>
          Giá trị giảm {form.type === "fixed_amount" ? "(đ)" : "(%)"}
          <input
            type="number"
            min={0}
            required
            value={form.value}
            onChange={(event) => updateField("value", Number(event.target.value))}
            className={adminFieldInputClassName}
          />
        </label>

        {form.type !== "fixed_amount" && form.type !== "free_shipping" && (
          <label className={adminFieldLabelClassName}>
            Giảm tối đa (đ, tùy chọn)
            <input
              type="number"
              min={0}
              value={form.maxDiscountAmount ?? ""}
              onChange={(event) => updateField("maxDiscountAmount", toOptionalNumber(event.target.value))}
              className={adminFieldInputClassName}
            />
          </label>
        )}
      </div>

      <label className={adminFieldLabelClassName}>
        Giá trị đơn tối thiểu (đ, tùy chọn)
        <input
          type="number"
          min={0}
          value={form.minimumOrderAmount ?? ""}
          onChange={(event) => updateField("minimumOrderAmount", toOptionalNumber(event.target.value))}
          className={adminFieldInputClassName}
        />
      </label>

      {isProductScoped && (
        <>
          <div>
            <span className={adminFieldLabelClassName}>Áp dụng cho danh mục</span>

            {categoryOptions.length === 0 ? (
              <p className="mt-2 text-[13px] text-brand-muted">Chưa có danh mục nào.</p>
            ) : (
              <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
                {categoryOptions.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 rounded-lg border border-brand-line px-3 py-2 text-[13px] font-medium text-brand-ink"
                  >
                    <input
                      type="checkbox"
                      checked={(form.applicableCategoryIds ?? []).includes(category.id)}
                      onChange={() => toggleApplicableCategory(category.id)}
                      className="size-4 shrink-0 accent-brand-green"
                    />
                    <span className="truncate">{category.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className={adminFieldLabelClassName}>Áp dụng cho sản phẩm cụ thể</span>

            {productOptions.length === 0 ? (
              <p className="mt-2 text-[13px] text-brand-muted">Chưa có sản phẩm nào.</p>
            ) : (
              <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
                {productOptions.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 rounded-lg border border-brand-line px-3 py-2 text-[13px] font-medium text-brand-ink"
                  >
                    <input
                      type="checkbox"
                      checked={(form.applicableProductIds ?? []).includes(product.id)}
                      onChange={() => toggleApplicableProduct(product.id)}
                      className="size-4 shrink-0 accent-brand-green"
                    />
                    <span className="truncate">{product.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={adminFieldLabelClassName}>
          Tổng lượt sử dụng (tùy chọn)
          <input
            type="number"
            min={0}
            value={form.usageLimit ?? ""}
            onChange={(event) => updateField("usageLimit", toOptionalNumber(event.target.value))}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Ngày bắt đầu (tùy chọn)
          <input
            type="date"
            value={toDateInputValue(form.startAt)}
            onChange={(event) => updateField("startAt", fromDateInputValue(event.target.value))}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Ngày kết thúc (tùy chọn)
          <input
            type="date"
            value={toDateInputValue(form.endAt)}
            onChange={(event) => updateField("endAt", fromDateInputValue(event.target.value))}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Trạng thái
        <select
          value={form.status}
          onChange={(event) => updateField("status", event.target.value as PromotionStatus)}
          className={adminFieldInputClassName}
        >
          <option value="draft">Nháp</option>
          <option value="active">Đang áp dụng</option>
          <option value="inactive">Ngừng áp dụng</option>
        </select>
      </label>
    </DataEditor>
  );
}
