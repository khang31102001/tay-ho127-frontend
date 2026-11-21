"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { DataEditor } from "@/shared/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/shared/admin/templates/formFieldClassName";
import { StatusBadge } from "@/shared/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";
import { formatFileSize } from "@/core/utils/format-file-size";
import { MEDIA_TYPE_OPTIONS, type MediaType } from "../types/media.types";

import { useMediaEditor } from "../hooks/useMediaEditor";
import { MediaCategorySelect } from "./MediaCategorySelect";
import { MediaPurgeDialog } from "./MediaPurgeDialog";

import { AdminSelect } from "@/shared/admin/templates/AdminSelect";
type MediaEditorProps = {
  id: string;
};

/** Sửa một media (metadata/URL — không đổi file đã upload). Thêm mới dùng MediaBulkCreator. */
export function MediaEditor({ id }: MediaEditorProps) {
  const {
    media,
    form,
    status,
    updateField,
    isLoading,
    loadError,
    handleSave,
    handleDelete,
    goToExplore,
  } = useMediaEditor({ id });
  const { hasPermission } = useAdminAuth();
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);
  const [isPurged, setIsPurged] = useState(false);

  return (
    <DataEditor
      title="Sửa media"
      backHref="/admin/catalog/media"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={status === "active" && hasPermission("media.delete") ? handleDelete : undefined}
      onDeleted={goToExplore}
      deleteConfirmTitle="Ngừng sử dụng media này?"
      deleteConfirmDescription="Media sẽ chuyển sang Ngừng hoạt động và không còn hiển thị trên Site."
    >
      <p className="flex items-center gap-2 text-[13px] text-brand-muted">
        Trạng thái: <StatusBadge status={status} />
      </p>

      <label className={adminFieldLabelClassName}>
        Tên file
        <input
          type="text"
          required
          value={form.fileName}
          onChange={(event) => updateField("fileName", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <label className={adminFieldLabelClassName}>
        URL
        <input
          type="text"
          required
          placeholder="https://... hoặc /images/ten-file.jpg"
          value={form.url}
          onChange={(event) => updateField("url", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Loại file
          <AdminSelect
            value={form.type}
            onChange={(event) => updateField("type", event.target.value as MediaType)}
            className={adminFieldInputClassName}
          >
            {MEDIA_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>
        </label>

        <label className={adminFieldLabelClassName}>
          Dung lượng (byte) — {formatFileSize(form.size)}
          <input
            type="number"
            min={0}
            disabled
            title="Không sửa được dung lượng sau khi tạo."
            value={form.size}
            className={`${adminFieldInputClassName} disabled:bg-brand-line/30`}
          />
        </label>
      </div>

      <MediaCategorySelect
        value={form.categoryCode}
        onChange={(code) => updateField("categoryCode", code)}
        hint="Nhóm cho biết ảnh được thêm từ đâu, giúp lọc nhanh trong thư viện và popup chọn ảnh."
      />

      <label className={adminFieldLabelClassName}>
        Alt text (tùy chọn)
        <input
          type="text"
          value={form.altText ?? ""}
          onChange={(event) => updateField("altText", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      {media && hasPermission("media.purge") && (
        <section className="rounded-lg border border-admin-danger/40 px-4 py-3">
          <h3 className="text-[13px] font-bold text-admin-danger">Xóa vĩnh viễn</h3>
          <p className="mt-1 text-[12px] text-brand-muted">
            Xóa file khỏi nơi lưu (Server/Cloud) và khỏi thư viện để giải phóng dung lượng. Không thể hoàn tác; media
            đang được dùng ở sản phẩm, bài viết, banner... phải được gỡ trước.
          </p>
          <button
            type="button"
            onClick={() => setIsPurgeOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-admin-danger px-3 py-1.5 text-[12px] font-bold text-admin-danger transition hover:bg-admin-danger/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Xóa vĩnh viễn
          </button>
        </section>
      )}

      {isPurgeOpen && media && (
        <MediaPurgeDialog
          media={[media]}
          onClose={() => {
            setIsPurgeOpen(false);
            if (isPurged) goToExplore();
          }}
          onFinished={(deletedIds) => setIsPurged(deletedIds.includes(media.id))}
        />
      )}
    </DataEditor>
  );
}
