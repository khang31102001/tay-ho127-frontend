"use client";

import { Plus, Trash2 } from "lucide-react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import { useModifierGroupEditor } from "../hooks/useModifierGroupEditor";
import { MODIFIER_SELECTION_TYPE_OPTIONS, type ModifierSelectionType } from "../types/modifier-group.types";

type ModifierGroupEditorProps = {
  id?: string;
};

export function ModifierGroupEditor({ id }: ModifierGroupEditorProps) {
  const {
    form,
    updateField,
    addOption,
    updateOption,
    removeOption,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useModifierGroupEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa nhóm tùy chọn món" : "Thêm nhóm tùy chọn món"}
      backHref="/admin/catalog/modifier-groups"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Tên nhóm (hiển thị cho khách, vd. &quot;Nước mắm&quot;, &quot;Rau&quot;)
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
          Kiểu chọn
          <select
            value={form.selectionType}
            onChange={(event) => updateField("selectionType", event.target.value as ModifierSelectionType)}
            className={adminFieldInputClassName}
          >
            {MODIFIER_SELECTION_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2.5 self-end pb-2.5 text-[13px] font-bold text-brand-greenDark">
          <input
            type="checkbox"
            checked={form.isRequired}
            onChange={(event) => updateField("isRequired", event.target.checked)}
            className="size-4 shrink-0 accent-brand-green"
          />
          Bắt buộc khách phải chọn
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className={adminFieldLabelClassName}>Các lựa chọn</span>
          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-green px-3 py-1.5 text-[13px] font-bold text-brand-greenDark transition hover:bg-brand-green/10"
          >
            <Plus className="size-4" />
            Thêm lựa chọn
          </button>
        </div>

        {form.options.length === 0 ? (
          <p className="mt-2 text-[13px] text-brand-muted">Chưa có lựa chọn nào — bấm &quot;Thêm lựa chọn&quot; để bắt đầu.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {form.options.map((option) => (
              <div
                key={option.id}
                className="grid grid-cols-1 items-center gap-2 rounded-lg border border-brand-line p-3 sm:grid-cols-[1fr_140px_auto_auto]"
              >
                <input
                  type="text"
                  required
                  placeholder="Tên lựa chọn (vd. Cay nhiều)"
                  value={option.label}
                  onChange={(event) => updateOption(option.id, "label", event.target.value)}
                  className={adminFieldInputClassName}
                />

                <input
                  type="number"
                  placeholder="Chênh lệch giá"
                  value={option.priceAdjustment}
                  onChange={(event) => updateOption(option.id, "priceAdjustment", Number(event.target.value))}
                  className={adminFieldInputClassName}
                />

                <label className="flex items-center gap-1.5 whitespace-nowrap text-[12px] font-bold text-brand-greenDark">
                  <input
                    type={form.selectionType === "single" ? "radio" : "checkbox"}
                    name="default-option"
                    checked={option.isDefault}
                    onChange={(event) => updateOption(option.id, "isDefault", event.target.checked)}
                    className="size-4 shrink-0 accent-brand-green"
                  />
                  Mặc định
                </label>

                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  aria-label={`Xóa lựa chọn ${option.label || ""}`}
                  className="flex size-8 items-center justify-center rounded text-brand-muted transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DataEditor>
  );
}
