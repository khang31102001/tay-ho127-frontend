"use client";

import type { ReactNode } from "react";

import { adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import type { SeoSchemaFormValue } from "../types/seo-schema.types";

type StructuredDataSectionProps = {
  /** Tên hiển thị của Schema Type đang cấu hình (vd. "Product"). */
  schemaTypeLabel: string;
  /** JSON-LD generate tự động từ dữ liệu entity — dùng làm preview khi CHƯA bật Advanced Mode. */
  generatedPreview: object;
  form: SeoSchemaFormValue;
  updateField: <K extends keyof SeoSchemaFormValue>(field: K, value: SeoSchemaFormValue[K]) => void;
  jsonError: string | null;
  /** Field phụ không có trên entity gốc (vd. SKU/Brand cho Product — Task 7). */
  children?: ReactNode;
};

/**
 * Task 13 (section "Structured Data" trong SEO Editor) + Task 7/10: hiển thị
 * JSON-LD đã generate, cho phép thêm field phụ (children), và bật Advanced
 * Mode để nhập JSON-LD thủ công thay thế hoàn toàn (validate trước khi lưu ở
 * useSeoSchemaForm.ts — component này chỉ hiển thị lỗi, không tự validate).
 */
export function StructuredDataSection({
  schemaTypeLabel,
  generatedPreview,
  form,
  updateField,
  jsonError,
  children,
}: StructuredDataSectionProps) {
  return (
    <section className="space-y-4 border-t border-brand-line pt-6">
      <h3 className="text-[13px] font-black uppercase tracking-wide text-brand-greenDark">
        Cấu trúc dữ liệu (Schema.org — {schemaTypeLabel})
      </h3>

      {children && <div className="grid gap-4 sm:grid-cols-2">{children}</div>}

      <label className="flex items-center gap-2 text-[13px] font-medium text-brand-ink">
        <input
          type="checkbox"
          checked={form.isCustomOverride}
          onChange={(event) => updateField("isCustomOverride", event.target.checked)}
          className="size-4 accent-brand-green"
        />
        Advanced Mode — nhập JSON-LD thủ công thay vì tự động generate
      </label>

      {form.isCustomOverride ? (
        <div>
          <label className={adminFieldLabelClassName}>
            Custom JSON-LD
            <textarea
              value={form.customJsonLd ?? ""}
              onChange={(event) => updateField("customJsonLd", event.target.value || null)}
              rows={10}
              spellCheck={false}
              placeholder={JSON.stringify(generatedPreview, null, 2)}
              className="mt-1.5 block w-full rounded-lg border border-brand-line bg-white px-3.5 py-2 font-mono text-[12.5px] text-brand-ink outline-none transition focus:border-brand-green"
            />
          </label>
          {jsonError && <p className="mt-1 text-[12px] font-medium text-red-600">{jsonError}</p>}
        </div>
      ) : (
        <div>
          <span className={adminFieldLabelClassName}>JSON-LD sẽ render trên trang (tự động generate)</span>
          <pre className="mt-1.5 max-h-80 overflow-auto rounded-lg border border-brand-line bg-brand-cream/40 p-3 text-[12px] text-brand-ink">
            {JSON.stringify(generatedPreview, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
