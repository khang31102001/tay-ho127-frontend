"use client";

import { useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";

import { adminFieldInputClassName } from "@/shared/admin/templates/formFieldClassName";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { listPages } from "@/features/content/pages/services/page.service";
import { createSection, listSectionsByPageId } from "@/features/content/page-sections/services/page-section.service";
import type { ManagedPageSection } from "@/features/content/page-sections/types/page-section.types";

type PageWithBannerSections = {
  pageId: string;
  pageName: string;
  sections: ManagedPageSection[];
};

type BannerSectionPickerProps = {
  selectedIds: string[];
  onChange: (sectionIds: string[]) => void;
};

/** Khóa section ổn định để Site tìm theo thứ tự; duy nhất trong trang nhờ hậu tố thời gian. */
function newSectionKey() {
  return `banner-${Date.now().toString(36)}`;
}

function sectionLabel(section: ManagedPageSection) {
  return section.heading || section.sectionKey || "Section banner";
}

/**
 * Chọn các section banner mà banner được hiển thị: Trang → Section (chỉ section loại Banner). Vị trí là dữ liệu: trang chưa có
 * section banner thì tạo ngay tại đây ("Thêm section banner"), banner hiện ở đúng chỗ section đó đứng trên trang.
 */
export function BannerSectionPicker({ selectedIds, onChange }: BannerSectionPickerProps) {
  const groups = useAsyncData<PageWithBannerSections[]>(
    async () => {
      const pages = await listPages();
      return Promise.all(
        pages.map(async (page) => ({
          pageId: page.id,
          pageName: page.name,
          sections: (await listSectionsByPageId(page.id)).filter((section) => section.sectionType === "banner"),
        })),
      );
    },
    [],
    { fallbackError: "Không thể tải danh sách trang và section." },
  );

  const [creatingPageId, setCreatingPageId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  function toggle(sectionId: string) {
    onChange(selectedIds.includes(sectionId) ? selectedIds.filter((id) => id !== sectionId) : [...selectedIds, sectionId]);
  }

  async function handleCreate(pageId: string) {
    setIsCreating(true);
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
      await groups.reload();
      onChange([...selectedIds, created.id]);
      setCreatingPageId(null);
      setNewName("");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Không tạo được section banner.");
    } finally {
      setIsCreating(false);
    }
  }

  if (groups.isLoading) {
    return (
      <p className="flex items-center gap-2 text-[13px] text-brand-muted">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Đang tải trang và section...
      </p>
    );
  }

  if (groups.error) {
    return <p className="text-[13px] text-brand-red">{groups.error}</p>;
  }

  return (
    <div className="space-y-3">
      {(groups.data ?? []).map((group) => (
        <div key={group.pageId} className="rounded-lg border border-brand-line p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-black text-brand-greenDark">{group.pageName}</p>
            <button
              type="button"
              onClick={() => {
                setCreatingPageId(creatingPageId === group.pageId ? null : group.pageId);
                setCreateError(null);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-brand-line px-2.5 py-1 text-[12px] font-bold text-brand-greenDark transition hover:bg-brand-green/5"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Thêm section banner
            </button>
          </div>

          {group.sections.length === 0 ? (
            <p className="mt-2 text-[12px] text-brand-muted">Trang này chưa có section banner.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {group.sections.map((section) => (
                <li key={section.id}>
                  <label className="flex items-center gap-2.5 text-[13px] text-brand-ink">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(section.id)}
                      onChange={() => toggle(section.id)}
                      className="size-4 shrink-0 accent-brand-green"
                    />
                    {sectionLabel(section)}
                    {!section.isVisible && <span className="text-[11px] text-brand-muted">(đang ẩn)</span>}
                  </label>
                </li>
              ))}
            </ul>
          )}

          {creatingPageId === group.pageId && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Tên section (vd. Ưu đãi cuối trang)"
                  className={adminFieldInputClassName}
                />
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={() => handleCreate(group.pageId)}
                  className="shrink-0 rounded-lg bg-brand-green px-4 py-2 text-[13px] font-bold text-white transition hover:bg-brand-greenDark disabled:opacity-50"
                >
                  {isCreating ? "Đang tạo..." : "Tạo"}
                </button>
              </div>
              <p className="text-[12px] text-brand-muted">
                Section mới nằm cuối trang; đổi vị trí ở Nội dung → Trang → Sections. Site tự hiển thị banner của section.
              </p>
              {createError && <p className="text-[12px] text-brand-red">{createError}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
