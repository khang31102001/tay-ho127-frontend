"use client";

import Link from "next/link";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import { useNavigationMenuEditor } from "../hooks/useNavigationMenuEditor";
import { NAVIGATION_LOCATION_OPTIONS } from "../types/navigation.types";
import { SITE_NAVIGATION_CONTAINERS_PATH } from "../utils/navigation-scope";

type NavigationMenuEditorProps = {
  id: string;
};

export function NavigationMenuEditor({ id }: NavigationMenuEditorProps) {
  const { form, updateField, menu, isLoading, loadError, handleSave, goToExplore } = useNavigationMenuEditor({ id });
  const locationLabel = NAVIGATION_LOCATION_OPTIONS.find((option) => option.value === menu?.location)?.label ?? menu?.location;

  return (
    <DataEditor
      title="Sửa menu"
      backHref={SITE_NAVIGATION_CONTAINERS_PATH}
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
    >
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Code
          <input type="text" disabled value={menu?.code ?? ""} className={`${adminFieldInputClassName} disabled:bg-brand-line/30`} />
        </label>

        <label className={adminFieldLabelClassName}>
          Vị trí (cố định)
          <input type="text" disabled value={locationLabel ?? ""} className={`${adminFieldInputClassName} disabled:bg-brand-line/30`} />
        </label>
      </div>

      <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => updateField("isActive", event.target.checked)}
          className="size-4 shrink-0 accent-brand-green"
        />
        Kích hoạt menu này (tắt = Website không hiển thị menu ở vị trí này)
      </label>

      <div className="rounded-lg border border-brand-line bg-brand-cream/40 p-4">
        <Link
          href={`${SITE_NAVIGATION_CONTAINERS_PATH}/${id}/items`}
          className="text-[13px] font-bold text-brand-greenDark hover:underline"
        >
          Quản lý cấu trúc menu (mục/tree) →
        </Link>
      </div>
    </DataEditor>
  );
}
