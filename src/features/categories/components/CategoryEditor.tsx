"use client";

import { useState } from "react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import type { EntityStatus } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { SeoFieldsForm } from "@/features/seo";

import { useCategoryEditor } from "../hooks/useCategoryEditor";

type CategoryEditorProps = {
  id?: string;
};

const TABS: TabItem[] = [
  { id: "general", label: "Chung" },
  { id: "seo", label: "SEO" },
];

export function CategoryEditor({ id }: CategoryEditorProps) {
  const {
    form,
    updateField,
    parentOptions,
    mediaOptions,
    seo,
    seoSettings,
    isLoading,
    loadError,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useCategoryEditor({ id });
  const { hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <DataEditor
      title={isEditMode ? "Sửa danh mục" : "Thêm danh mục"}
      backHref="/admin/catalog/categories"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode && hasPermission("categories.delete") ? handleDelete : undefined}
      deleteConfirmDescription="Chỉ xóa được danh mục không còn danh mục con và sản phẩm. Hành động này không thể hoàn tác."
      onDeleted={goToExplore}
    >
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-5">
        {activeTab === "general" && (
          <div className="space-y-4">
            <label className={adminFieldLabelClassName}>
              Tên danh mục
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
                Danh mục cha (tùy chọn)
                <select
                  value={form.parentId ?? ""}
                  onChange={(event) =>
                    updateField("parentId", event.target.value === "" ? null : event.target.value)
                  }
                  className={adminFieldInputClassName}
                >
                  <option value="">Không có (danh mục gốc)</option>

                  {parentOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={adminFieldLabelClassName}>
                Thứ tự hiển thị
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => updateField("sortOrder", Number(event.target.value))}
                  className={adminFieldInputClassName}
                />
              </label>
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

        {activeTab === "seo" && seoSettings && (
          <SeoFieldsForm
            form={seo.form}
            updateField={seo.updateField}
            mediaOptions={mediaOptions}
            entityDefaults={{ title: form.name, description: "", imageMediaId: null }}
            settings={seoSettings}
            previewUrl={null}
          />
        )}
      </div>
    </DataEditor>
  );
}
