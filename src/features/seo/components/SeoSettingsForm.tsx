"use client";

import { useState } from "react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { MediaPicker } from "@/components/shared/MediaPicker";
import { StatusPopup } from "@/components/shared/StatusPopup";

import { useSeoSettingsForm } from "../hooks/useSeoSettingsForm";

/**
 * Task 5 — Global SEO Settings, singleton (giống BrandSettingsEditor: không
 * có backHref về danh sách thật, trỏ về SEO Dashboard). Chỉ ~7 field nên
 * không cần chia Tabs như Brand Settings.
 */
export function SeoSettingsForm() {
  const { form, isLoading, mediaOptions, updateField, handleSave } = useSeoSettingsForm();
  const [savedPopupOpen, setSavedPopupOpen] = useState(false);

  return (
    <>
      <DataEditor
        title="Cài đặt SEO chung"
        backHref="/admin/seo"
        onSave={handleSave}
        onSaved={() => setSavedPopupOpen(true)}
        isLoading={isLoading || !form}
        saveLabel="Lưu thay đổi"
      >
        {form && (
          <div className="space-y-4">
            <label className={adminFieldLabelClassName}>
              Mẫu tiêu đề mặc định (Title Template)
              <input
                type="text"
                required
                value={form.defaultTitleTemplate}
                onChange={(event) => updateField("defaultTitleTemplate", event.target.value)}
                placeholder="%s | Tên thương hiệu"
                className={adminFieldInputClassName}
              />
            </label>

            <label className={adminFieldLabelClassName}>
              Mô tả mặc định (Default Description)
              <textarea
                required
                value={form.defaultDescription}
                onChange={(event) => updateField("defaultDescription", event.target.value)}
                rows={3}
                className={`${adminFieldInputClassName} h-auto resize-none py-2`}
              />
            </label>

            <MediaPicker
              mediaType="image"
              label="OG Image mặc định"
              mediaOptions={mediaOptions}
              selectedId={form.defaultOgImageMediaId}
              onChange={(mediaId) => updateField("defaultOgImageMediaId", mediaId)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={adminFieldLabelClassName}>
                Twitter Site (tùy chọn)
                <input
                  type="text"
                  value={form.twitterSite ?? ""}
                  onChange={(event) => updateField("twitterSite", event.target.value || null)}
                  placeholder="@tayho127"
                  className={adminFieldInputClassName}
                />
              </label>

              <label className={adminFieldLabelClassName}>
                Twitter Creator (tùy chọn)
                <input
                  type="text"
                  value={form.twitterCreator ?? ""}
                  onChange={(event) => updateField("twitterCreator", event.target.value || null)}
                  className={adminFieldInputClassName}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-[13px] font-medium text-brand-ink">
                <input
                  type="checkbox"
                  checked={form.defaultRobotsIndex}
                  onChange={(event) => updateField("defaultRobotsIndex", event.target.checked)}
                  className="size-4 accent-brand-green"
                />
                Mặc định cho phép Index
              </label>

              <label className="flex items-center gap-2 text-[13px] font-medium text-brand-ink">
                <input
                  type="checkbox"
                  checked={form.defaultRobotsFollow}
                  onChange={(event) => updateField("defaultRobotsFollow", event.target.checked)}
                  className="size-4 accent-brand-green"
                />
                Mặc định cho phép Follow
              </label>
            </div>

            <label className={adminFieldLabelClassName}>
              robots.txt — Disallow paths (mỗi dòng 1 path, bắt đầu bằng &quot;/&quot;)
              <textarea
                value={form.robotsDisallowPaths.join("\n")}
                onChange={(event) =>
                  updateField(
                    "robotsDisallowPaths",
                    event.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                  )
                }
                rows={6}
                spellCheck={false}
                placeholder={"/admin\n/checkout"}
                className={`${adminFieldInputClassName} h-auto resize-none py-2 font-mono`}
              />
            </label>
            <p className="text-[12px] text-brand-muted">
              Áp dụng cho toàn site (robots.txt) — khác 2 checkbox Index/Follow phía trên (áp dụng per-page qua SEO
              Metadata). Đã rà soát routing thực tế: /gio-hang, /tai-khoan, /don-hang, /payment là các route giao
              dịch/cá nhân hoá, mặc định đề xuất disallow — có thể sửa lại tuỳ business rule.
            </p>

            <p className="rounded-lg border border-dashed border-brand-line bg-brand-cream/40 p-3 text-[12.5px] text-brand-muted">
              Tên thương hiệu, URL site, thông tin liên hệ và mạng xã hội dùng cho Schema Organization/Restaurant lấy
              trực tiếp từ Cài đặt thương hiệu (Admin → Brand → Cài đặt thương hiệu), không lặp lại ở đây.
            </p>
          </div>
        )}
      </DataEditor>

      <StatusPopup
        open={savedPopupOpen}
        status="success"
        title="Đã lưu cài đặt SEO."
        onOpenChange={setSavedPopupOpen}
        actions={[{ id: "close", label: "Đóng", variant: "secondary" }]}
      />
    </>
  );
}
