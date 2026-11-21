"use client";

import { useState } from "react";
import { LoaderCircle, Plus, X } from "lucide-react";

import { AdminSelect } from "@/shared/admin/templates/AdminSelect";
import { adminButtonClassName, adminFieldInputClassName, adminFieldLabelClassName } from "@/shared/admin/templates/formFieldClassName";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { listPages } from "@/features/content/pages/services/page.service";
import { createSection, listSectionsByPageId } from "@/features/content/page-sections/services/page-section.service";
import type { ManagedPageSection } from "@/features/content/page-sections/types/page-section.types";

import type { BannerSectionRef } from "../types/banner.types";

type BannerSectionPickerProps = {
  selected: BannerSectionRef[];
  onChange: (sections: BannerSectionRef[]) => void;
};

/** Khóa section ổn định để Site tìm theo thứ tự; duy nhất trong trang nhờ hậu tố thời gian. */
function newSectionKey() {
  return `banner-${Date.now().toString(36)}`;
}

function sectionLabel(section: ManagedPageSection) {
  return section.heading || section.sectionKey || "Section banner";
}

/**
 * Chọn các section banner mà banner được hiển thị, gọn trong 3 bước: (1) chip các vị trí đã chọn (bấm × để gỡ), (2) chọn MỘT
 * trang, (3) tick các section banner của trang đó. Trang chưa có section banner thì tạo ngay ("Thêm section banner vào trang
 * này"). Vị trí là dữ liệu: banner hiện đúng chỗ section đó đứng trên trang.
 */
export function BannerSectionPicker({ selected, onChange }: BannerSectionPickerProps) {
  const pages = useAsyncData(listPages, [], { fallbackError: "Không thể tải danh sách trang." });
  const [pageId, setPageId] = useState("");
  const sections = useAsyncData(
    async () => (await listSectionsByPageId(pageId)).filter((section) => section.sectionType === "banner"),
    [pageId],
    { enabled: pageId !== "", fallbackError: "Không thể tải các section của trang." },
  );

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const pageName = pages.data?.find((page) => page.id === pageId)?.name ?? "";
  const isSelected = (sectionId: string) => selected.some((item) => item.sectionId === sectionId);

  function toRef(section: ManagedPageSection): BannerSectionRef {
    return { sectionId: section.id, pageId, pageName, sectionLabel: sectionLabel(section) };
  }

  function toggle(section: ManagedPageSection) {
    onChange(
      isSelected(section.id) ? selected.filter((item) => item.sectionId !== section.id) : [...selected, toRef(section)],
    );
  }

  async function handleCreate() {
    setIsSavingNew(true);
    setCreateError(null);
    try {
      const siblings = await listSectionsByPageId(pageId);
      const created = await createSection({
        pageId,
        sectionKey: newSectionKey(),
        sectionType: "banner",
        heading: newName.trim() || "Banner",
        displayOrder: Math.max(0, ...siblings.map((section) => section.displayOrder)) + 10,
        isVisible: true,
        galleryMediaIds: [],
        items: [],
      });
      await sections.reload();
      onChange([...selected, toRef(created)]);
      setIsCreating(false);
      setNewName("");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Không tạo được section banner.");
    } finally {
      setIsSavingNew(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className={adminFieldLabelClassName}>Đã chọn</p>
        {selected.length === 0 ? (
          <p className="mt-1.5 text-admin-sm text-admin-textSecondary">Chưa chọn vị trí nào — banner chưa hiện ở đâu trên Site.</p>
        ) : (
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {selected.map((item) => (
              <li
                key={item.sectionId}
                className="inline-flex items-center gap-1.5 rounded-full bg-admin-primaryLight px-3 py-1 text-admin-sm font-semibold text-admin-primary"
              >
                {item.pageName} › {item.sectionLabel}
                <button
                  type="button"
                  aria-label={`Gỡ ${item.pageName} › ${item.sectionLabel}`}
                  onClick={() => onChange(selected.filter((other) => other.sectionId !== item.sectionId))}
                  className="rounded-full hover:bg-admin-primary/10"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className={adminFieldLabelClassName}>
        Thêm vào trang
        <AdminSelect
          value={pageId}
          onChange={(event) => {
            setPageId(event.target.value);
            setIsCreating(false);
            setCreateError(null);
          }}
          className={adminFieldInputClassName}
        >
          <option value="">{pages.isLoading ? "Đang tải trang..." : "Chọn trang..."}</option>
          {(pages.data ?? []).map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </AdminSelect>
      </label>
      {pages.error && <p className="text-admin-sm text-admin-dangerText">{pages.error}</p>}

      {pageId !== "" && (
        <div className="rounded-admin border border-admin-border p-3">
          {sections.isLoading ? (
            <p className="flex items-center gap-2 text-admin-sm text-admin-textSecondary">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Đang tải section...
            </p>
          ) : sections.error ? (
            <p className="text-admin-sm text-admin-dangerText">{sections.error}</p>
          ) : (sections.data ?? []).length === 0 ? (
            <p className="text-admin-sm text-admin-textSecondary">Trang này chưa có section banner.</p>
          ) : (
            <ul className="space-y-1.5">
              {(sections.data ?? []).map((section) => (
                <li key={section.id}>
                  <label className="flex items-center gap-2.5 text-admin-base text-admin-text">
                    <input
                      type="checkbox"
                      checked={isSelected(section.id)}
                      onChange={() => toggle(section)}
                      className="size-4 shrink-0 accent-admin-primary"
                    />
                    {sectionLabel(section)}
                    {!section.isVisible && <span className="text-admin-xs text-admin-muted">(đang ẩn)</span>}
                  </label>
                </li>
              ))}
            </ul>
          )}

          {isCreating ? (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Tên section (vd. Ưu đãi cuối trang)"
                  className={`${adminFieldInputClassName} mt-0`}
                />
                <button type="button" disabled={isSavingNew} onClick={handleCreate} className={adminButtonClassName.primary}>
                  {isSavingNew ? "Đang tạo..." : "Tạo"}
                </button>
                <button type="button" disabled={isSavingNew} onClick={() => setIsCreating(false)} className={adminButtonClassName.secondary}>
                  Hủy
                </button>
              </div>
              <p className="text-admin-xs text-admin-textSecondary">
                Section mới nằm cuối trang; đổi vị trí ở Nội dung → Page → Sections.
              </p>
              {createError && <p className="text-admin-xs text-admin-dangerText">{createError}</p>}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="mt-3 inline-flex items-center gap-1 text-admin-sm font-semibold text-admin-primary hover:underline"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Thêm section banner vào trang này
            </button>
          )}
        </div>
      )}
    </div>
  );
}
