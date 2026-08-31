"use client";

import Link from "next/link";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import { useNavigationMenuEditor } from "../hooks/useNavigationMenuEditor";
import { NAVIGATION_LOCATION_OPTIONS, type NavigationLocation } from "../types/navigation.types";

type NavigationMenuEditorProps = {
  id?: string;
};

export function NavigationMenuEditor({ id }: NavigationMenuEditorProps) {
  const { form, updateField, isLoading, isEditMode, handleSave, handleDelete, goToExplore } = useNavigationMenuEditor({
    id,
  });

  return (
    <DataEditor
      title={isEditMode ? "Sửa menu" : "Thêm menu"}
      backHref="/admin/settings/navigation"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Tên menu
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Code
          <input
            type="text"
            required
            value={form.code}
            onChange={(event) => updateField("code", event.target.value)}
            placeholder="vd. MAIN_HEADER"
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Vị trí (Location)
        <select
          value={form.location}
          onChange={(event) => updateField("location", event.target.value as NavigationLocation)}
          className={adminFieldInputClassName}
        >
          {NAVIGATION_LOCATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => updateField("isActive", event.target.checked)}
          className="size-4 shrink-0 accent-brand-green"
        />
        Kích hoạt menu này
      </label>

      {isEditMode && (
        <div className="rounded-lg border border-brand-line bg-brand-cream/40 p-4">
          <Link
            href={`/admin/settings/navigation/${id}/items`}
            className="text-[13px] font-bold text-brand-greenDark hover:underline"
          >
            Quản lý cấu trúc menu (mục/tree) →
          </Link>
        </div>
      )}
    </DataEditor>
  );
}
