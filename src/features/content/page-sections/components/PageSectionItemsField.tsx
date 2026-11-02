"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import type { ManagedMedia } from "@/features/media";
import { MediaPicker } from "@/features/media/components/MediaPicker";
import {
  adminButtonClassName,
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/shared/admin/templates/formFieldClassName";

import type { PageSectionItem, SectionType } from "../types/page-section.types";

/** Backend giới hạn 20 dòng mỗi section. */
const MAX_ITEMS = 20;

type ItemFieldKey = "label" | "title" | "text" | "url";

type ItemFieldConfig = {
  key: ItemFieldKey;
  label: string;
  multiline?: boolean;
};

/** Ô nhập của mỗi dòng theo loại section — khớp cách Site đọc (xem features/home/services/stats.service.ts). */
const ITEM_FIELDS: Partial<Record<SectionType, { heading: string; fields: ItemFieldConfig[]; hasImage: boolean }>> = {
  stats: {
    heading: "Số liệu (mỗi dòng một ô; giá trị bắt đầu bằng số thì Site cho chạy số, vd. “60+”, “5.000+”)",
    fields: [
      { key: "title", label: "Giá trị" },
      { key: "label", label: "Nhãn" },
    ],
    hasImage: false,
  },
  timeline: {
    heading: "Các mốc (bắt buộc Tiêu đề và Nội dung)",
    fields: [
      { key: "label", label: "Năm / nhãn mốc" },
      { key: "title", label: "Tiêu đề" },
      { key: "text", label: "Nội dung", multiline: true },
    ],
    hasImage: true,
  },
  faq: {
    heading: "Câu hỏi (bắt buộc Câu hỏi và Trả lời)",
    fields: [
      { key: "title", label: "Câu hỏi" },
      { key: "text", label: "Trả lời", multiline: true },
    ],
    hasImage: false,
  },
};

const EMPTY_ITEM: PageSectionItem = { label: "", title: "", text: "", mediaId: null, url: "" };

type PageSectionItemsFieldProps = {
  sectionType: SectionType;
  items: PageSectionItem[];
  mediaOptions: ManagedMedia[];
  onChange: (items: PageSectionItem[]) => void;
};

/** Danh sách dòng của section stats / timeline / faq; loại khác không có danh sách → không hiện gì. */
export function PageSectionItemsField({ sectionType, items, mediaOptions, onChange }: PageSectionItemsFieldProps) {
  const config = ITEM_FIELDS[sectionType];
  if (!config) {
    return null;
  }

  function updateItem(index: number, patch: Partial<PageSectionItem>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function moveItem(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <fieldset className="space-y-3">
      <legend className={adminFieldLabelClassName}>{config.heading}</legend>

      {items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-brand-muted/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-brand-muted">Dòng {index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Đưa lên trên"
                disabled={index === 0}
                onClick={() => moveItem(index, -1)}
                className="flex size-7 items-center justify-center rounded text-brand-muted hover:bg-brand-green/10 disabled:opacity-30"
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Đưa xuống dưới"
                disabled={index === items.length - 1}
                onClick={() => moveItem(index, 1)}
                className="flex size-7 items-center justify-center rounded text-brand-muted hover:bg-brand-green/10 disabled:opacity-30"
              >
                <ArrowDown className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Xóa dòng"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                className="flex size-7 items-center justify-center rounded text-brand-red hover:bg-brand-red/10"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {config.fields.map((field) => (
              <label
                key={field.key}
                className={`${adminFieldLabelClassName} ${field.multiline ? "sm:col-span-2" : ""}`}
              >
                {field.label}
                {field.multiline ? (
                  <textarea
                    value={item[field.key]}
                    onChange={(event) => updateItem(index, { [field.key]: event.target.value })}
                    rows={3}
                    className={`${adminFieldInputClassName} h-auto resize-none py-2`}
                  />
                ) : (
                  <input
                    type="text"
                    value={item[field.key]}
                    onChange={(event) => updateItem(index, { [field.key]: event.target.value })}
                    className={adminFieldInputClassName}
                  />
                )}
              </label>
            ))}
          </div>

          {config.hasImage && (
            <MediaPicker
              mediaType="image"
              label="Ảnh (tùy chọn)"
              mediaOptions={mediaOptions}
              selectedId={item.mediaId}
              onChange={(mediaId) => updateItem(index, { mediaId })}
            />
          )}
        </div>
      ))}

      <button
        type="button"
        disabled={items.length >= MAX_ITEMS}
        onClick={() => onChange([...items, EMPTY_ITEM])}
        className={adminButtonClassName.outline}
      >
        + Thêm dòng
      </button>
    </fieldset>
  );
}
