"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { SlugInput } from "@/components/shared/SlugInput";
import { MediaPicker } from "@/components/shared/MediaPicker";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import type { PublishStatus } from "@/components/shared/PublishStatusBadge";

import { useArticleEditor } from "../hooks/useArticleEditor";

type ArticleEditorProps = {
  id?: string;
};

export function ArticleEditor({ id }: ArticleEditorProps) {
  const {
    form,
    updateField,
    toggleTag,
    mediaOptions,
    categoryOptions,
    tagOptions,
    isLoading,
    isEditMode,
    isSlugAvailable,
    previewSlug,
    handleSave,
    handleDelete,
    goToExplore,
  } = useArticleEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa bài viết" : "Thêm bài viết"}
      backHref="/admin/content/articles"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <div className="flex items-start justify-between gap-3">
        <label className={`flex-1 ${adminFieldLabelClassName}`}>
          Tiêu đề
          <input
            type="text"
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        {previewSlug && (
          <Link
            href={`/bai-viet/${previewSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-line px-3.5 py-2.5 text-[13px] font-bold text-brand-greenDark transition hover:border-brand-green hover:bg-brand-green/5"
          >
            <Eye className="size-4" />
            Xem trước
          </Link>
        )}
      </div>

      <SlugInput
        value={form.slug}
        onChange={(value) => updateField("slug", value)}
        sourceValue={form.title}
        enableAutoGenerate={!isEditMode}
        isAvailable={isSlugAvailable}
      />

      <label className={adminFieldLabelClassName}>
        Tóm tắt
        <textarea
          required
          value={form.summary}
          onChange={(event) => updateField("summary", event.target.value)}
          rows={2}
          className={`${adminFieldInputClassName} h-auto resize-none py-2`}
        />
      </label>

      <div>
        <span className={adminFieldLabelClassName}>Nội dung</span>
        <div className="mt-1.5">
          <RichTextEditor
            value={form.content}
            onChange={(html) => updateField("content", html)}
            placeholder="Nội dung bài viết..."
          />
        </div>
      </div>

      <MediaPicker
        label="Ảnh đại diện"
        mediaOptions={mediaOptions}
        selectedId={form.featuredMediaId}
        onChange={(mediaId) => updateField("featuredMediaId", mediaId)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Danh mục
          <select
            value={form.categoryId ?? ""}
            onChange={(event) =>
              updateField("categoryId", event.target.value === "" ? null : event.target.value)
            }
            className={adminFieldInputClassName}
          >
            <option value="">Không có</option>

            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className={adminFieldLabelClassName}>
          Tác giả
          <input
            type="text"
            required
            value={form.authorName}
            onChange={(event) => updateField("authorName", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <div>
        <span className={adminFieldLabelClassName}>Thẻ (tags)</span>

        {tagOptions.length === 0 ? (
          <p className="mt-2 text-[13px] text-brand-muted">Chưa có thẻ nào trong hệ thống.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {tagOptions.map((tag) => {
              const isChecked = form.tagIds.includes(tag.id);

              return (
                <label
                  key={tag.id}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition ${
                    isChecked
                      ? "border-brand-green bg-brand-green/10 text-brand-greenDark"
                      : "border-brand-line text-brand-muted hover:border-brand-green/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleTag(tag.id)}
                    className="hidden"
                  />
                  {tag.name}
                </label>
              );
            })}
          </div>
        )}
      </div>

      <label className={adminFieldLabelClassName}>
        Trạng thái
        <select
          value={form.status}
          onChange={(event) => updateField("status", event.target.value as PublishStatus)}
          className={adminFieldInputClassName}
        >
          <option value="draft">Bản nháp</option>
          <option value="published">Xuất bản</option>
          <option value="archived">Lưu trữ</option>
        </select>
      </label>
    </DataEditor>
  );
}
