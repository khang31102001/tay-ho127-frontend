"use client";

import Image from "next/image";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

import { useProductEditor } from "../hooks/useProductEditor";

type ProductEditorProps = {
  id?: string;
};

export function ProductEditor({ id }: ProductEditorProps) {
  const {
    form,
    updateField,
    toggleMedia,
    toggleModifierGroup,
    categoryOptions,
    mediaOptions,
    modifierGroupOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useProductEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa sản phẩm" : "Thêm sản phẩm"}
      backHref="/admin/catalog/products"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Tên sản phẩm
        <input
          type="text"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Danh mục
          <select
            required
            value={form.categoryId}
            onChange={(event) => updateField("categoryId", event.target.value)}
            className={adminFieldInputClassName}
          >
            <option value="" disabled>
              Chọn danh mục
            </option>

            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className={adminFieldLabelClassName}>
          Giá bán (đ)
          <input
            type="number"
            min={0}
            required
            value={form.price}
            onChange={(event) => updateField("price", Number(event.target.value))}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Mô tả (tùy chọn)
        <textarea
          value={form.description ?? ""}
          onChange={(event) => updateField("description", event.target.value)}
          rows={3}
          className={`${adminFieldInputClassName} h-auto resize-none py-2`}
        />
      </label>

      <div>
        <span className={adminFieldLabelClassName}>Media (chọn từ thư viện)</span>

        {mediaOptions.length === 0 ? (
          <p className="mt-2 text-[13px] text-brand-muted">
            Chưa có file nào trong thư viện Media.
          </p>
        ) : (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {mediaOptions.map((media) => (
              <label
                key={media.id}
                className="flex items-center gap-3 rounded-lg border border-brand-line px-3 py-2 text-[13px] font-medium text-brand-ink"
              >
                <input
                  type="checkbox"
                  checked={form.mediaIds.includes(media.id)}
                  onChange={() => toggleMedia(media.id)}
                  className="size-4 shrink-0 accent-brand-green"
                />

                {media.type === "image" ? (
                  <Image
                    src={media.url}
                    alt={media.altText ?? media.fileName}
                    width={32}
                    height={32}
                    className="size-8 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="size-8 shrink-0 rounded bg-brand-cream" />
                )}

                <span className="truncate">{media.fileName}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <span className={adminFieldLabelClassName}>Nhóm tùy chọn món (Modifier — tùy chọn)</span>

        {modifierGroupOptions.length === 0 ? (
          <p className="mt-2 text-[13px] text-brand-muted">
            Chưa có nhóm tùy chọn nào — tạo tại Catalog → Tùy chọn món (Modifier).
          </p>
        ) : (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {modifierGroupOptions.map((group) => (
              <label
                key={group.id}
                className="flex items-center gap-3 rounded-lg border border-brand-line px-3 py-2 text-[13px] font-medium text-brand-ink"
              >
                <input
                  type="checkbox"
                  checked={form.modifierGroupIds.includes(group.id)}
                  onChange={() => toggleModifierGroup(group.id)}
                  className="size-4 shrink-0 accent-brand-green"
                />
                <span className="truncate">
                  {group.name} ({group.options.length} lựa chọn)
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <label className={adminFieldLabelClassName}>
        Trạng thái
        <select
          value={form.status}
          onChange={(event) => updateField("status", event.target.value as EntityStatus)}
          className={adminFieldInputClassName}
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </label>
    </DataEditor>
  );
}
