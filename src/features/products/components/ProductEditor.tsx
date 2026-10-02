"use client";

import Image from "next/image";
import { useState } from "react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import type { EntityStatus } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { SeoFieldsForm, StructuredDataSection } from "@/features/seo";

import { useProductEditor } from "../hooks/useProductEditor";

type ProductEditorProps = {
  id?: string;
};

const TABS: TabItem[] = [
  { id: "general", label: "Chung" },
  { id: "seo", label: "SEO" },
];

export function ProductEditor({ id }: ProductEditorProps) {
  const {
    form,
    updateField,
    toggleMedia,
    toggleModifierGroup,
    categoryOptions,
    mediaOptions,
    modifierGroupOptions,
    seo,
    seoSettings,
    schema,
    generatedSchemaPreview,
    isLoading,
    loadError,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useProductEditor({ id });
  const { hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <DataEditor
      title={isEditMode ? "Sửa sản phẩm" : "Thêm sản phẩm"}
      backHref="/admin/catalog/products"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode && hasPermission("products.delete") ? handleDelete : undefined}
      deleteConfirmDescription="Sản phẩm cũng bị gỡ khỏi mọi thực đơn. Đơn hàng cũ không bị ảnh hưởng. Hành động này không thể hoàn tác."
      onDeleted={goToExplore}
    >
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "seo" ? (
        seoSettings && (
          <div className="pt-5">
            <SeoFieldsForm
              form={seo.form}
              updateField={seo.updateField}
              mediaOptions={mediaOptions}
              entityDefaults={{
                title: form.name,
                description: form.description ?? "",
                imageMediaId: form.mediaIds[0] ?? null,
              }}
              settings={seoSettings}
              previewUrl={isEditMode ? `/thuc-don/${id}` : null}
            />

            {isEditMode && (
              <StructuredDataSection
                schemaTypeLabel="Product"
                generatedPreview={generatedSchemaPreview}
                form={schema.form}
                updateField={schema.updateField}
                jsonError={schema.jsonError}
              >
                <label className={adminFieldLabelClassName}>
                  SKU (tùy chọn)
                  <input
                    type="text"
                    value={schema.form.config?.sku ?? ""}
                    onChange={(event) => schema.updateConfigField("sku", event.target.value)}
                    className={adminFieldInputClassName}
                  />
                </label>

                <label className={adminFieldLabelClassName}>
                  Brand (tùy chọn)
                  <input
                    type="text"
                    value={schema.form.config?.brand ?? ""}
                    onChange={(event) => schema.updateConfigField("brand", event.target.value)}
                    className={adminFieldInputClassName}
                  />
                </label>
              </StructuredDataSection>
            )}
          </div>
        )
      ) : (
      <div className="space-y-4 pt-5">
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

      <label className={adminFieldLabelClassName}>
        Slug (đường dẫn /thuc-don/…)
        <input
          type="text"
          value={form.slug}
          onChange={(event) => updateField("slug", event.target.value.trim().toLowerCase())}
          placeholder={isEditMode ? "Để trống = giữ slug hiện tại" : "Để trống = tự tạo từ tên sản phẩm"}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Chữ thường không dấu, số và dấu gạch ngang, vd. banh-cuon-nhan-thit"
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
      </div>
      )}
    </DataEditor>
  );
}
