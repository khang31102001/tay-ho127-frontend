"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";

import { usePageSectionsExplorer } from "../hooks/usePageSectionsExplorer";
import { SECTION_TYPE_OPTIONS, type ManagedPageSection } from "../types/page-section.types";

const SECTION_TYPE_LABEL = Object.fromEntries(
  SECTION_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

type PageSectionsExplorerProps = {
  pageId: string;
};

export function PageSectionsExplorer({ pageId }: PageSectionsExplorerProps) {
  const { rows, pageName, isLoading, handleDelete, handleMoveUp, handleMoveDown } =
    usePageSectionsExplorer({ pageId });

  const columns: DataExplorerColumn<ManagedPageSection>[] = [
    {
      key: "displayOrder",
      header: "Thứ tự",
      render: (row) => {
        const index = rows.findIndex((item) => item.id === row.id);

        return (
          <div className="flex items-center gap-1">
            <span className="w-5 text-center font-bold text-brand-ink">{row.displayOrder}</span>
            <button
              type="button"
              aria-label="Đưa lên trên"
              disabled={index <= 0}
              onClick={() => handleMoveUp(row)}
              className="flex size-6 items-center justify-center rounded text-brand-muted transition hover:bg-brand-green/10 hover:text-brand-greenDark disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowUp className="size-3.5" />
            </button>
            <button
              type="button"
              aria-label="Đưa xuống dưới"
              disabled={index === -1 || index >= rows.length - 1}
              onClick={() => handleMoveDown(row)}
              className="flex size-6 items-center justify-center rounded text-brand-muted transition hover:bg-brand-green/10 hover:text-brand-greenDark disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowDown className="size-3.5" />
            </button>
          </div>
        );
      },
    },
    {
      key: "sectionType",
      header: "Loại section",
      render: (row) => SECTION_TYPE_LABEL[row.sectionType] ?? row.sectionType,
    },
    { key: "heading", header: "Tiêu đề" },
    {
      key: "isVisible",
      header: "Hiển thị",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${
            row.isVisible
              ? "bg-brand-green/10 text-brand-greenDark"
              : "bg-brand-muted/10 text-brand-muted"
          }`}
        >
          {row.isVisible ? "Đang hiện" : "Đang ẩn"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Link
        href={`/admin/content/pages/${pageId}`}
        className="text-[13px] font-bold text-brand-muted transition hover:text-brand-greenDark"
      >
        ← Quay lại {pageName ? `"${pageName}"` : "danh sách page"}
      </Link>

      <div className="mt-3">
        <DataExplorer<ManagedPageSection>
          title={pageName ? `Section của "${pageName}"` : "Section"}
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          getSearchableText={(row) => `${row.heading ?? ""} ${row.sectionType}`}
          searchPlaceholder="Tìm section..."
          createHref={`/admin/content/pages/${pageId}/sections/new`}
          createLabel="Thêm section"
          editHref={(row) => `/admin/content/pages/${pageId}/sections/${row.id}`}
          onDelete={handleDelete}
          emptyState="Page này chưa có section nào."
        />
      </div>
    </div>
  );
}
