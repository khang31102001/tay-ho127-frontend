"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { AlertCircle, Check, FileText, LoaderCircle, Search, UploadCloud, Video, X } from "lucide-react";

import { cn } from "@/core/utils/cn";
import { formatFileSize } from "@/core/utils/format-file-size";
import { BottomSheetDialog } from "@/shared/ui/BottomSheetDialog";
import { Tabs, type TabItem } from "@/shared/ui/Tabs";
import type { ManagedMedia, MediaType } from "@/features/media";

import { PENDING_UPLOAD_PREFIX, useMediaPickerUpload, type PendingUpload } from "../hooks/useMediaPickerUpload";
import { MEDIA_UPLOAD_ACCEPT, MEDIA_UPLOAD_MAX_BYTES } from "../services/media-library.service";

/** "file" là tên gọi nghiệp vụ của loại "document" (PDF, tài liệu). */
export type MediaKind = MediaType | "file";

export function normalizeMediaKinds(kinds: MediaKind[] | undefined): MediaType[] | null {
  if (!kinds || kinds.length === 0) return null;
  return kinds.map((kind) => (kind === "file" ? "document" : kind));
}

const KIND_LABEL: Record<MediaType, string> = {
  image: "ảnh",
  video: "video",
  document: "file",
};

export function getMediaKindLabel(kinds: MediaType[] | null): string {
  return kinds && kinds.length === 1 ? KIND_LABEL[kinds[0]] : "media";
}

/** Thumbnail theo loại: ảnh → preview, video/tài liệu → icon. */
export function MediaThumb({ media, className = "size-10" }: { media: ManagedMedia; className?: string }) {
  if (media.type === "image") {
    return (
      <span className={`relative block shrink-0 overflow-hidden rounded bg-brand-cream ${className}`}>
        <Image src={media.url} alt={media.altText ?? media.fileName} fill sizes="160px" className="object-cover" />
      </span>
    );
  }

  const Icon = media.type === "video" ? Video : FileText;

  return (
    <span className={`flex shrink-0 items-center justify-center rounded bg-brand-cream text-brand-muted ${className}`}>
      <Icon className="size-1/2" aria-hidden="true" />
    </span>
  );
}

/** Số media render mỗi lượt — danh sách dài chỉ vẽ dần, bấm "Xem thêm" để vẽ tiếp. */
const PAGE_SIZE = 24;

const IMAGE_UPLOAD_ACCEPT = ".jpg,.jpeg,.png,.gif,.webp";

const PICKER_TABS: TabItem[] = [
  { id: "library", label: "Chọn từ Media" },
  { id: "upload", label: "Upload ảnh vào Media" },
];

type MediaPickerDialogProps = {
  title: string;
  mediaOptions: ManagedMedia[];
  /** null = không lọc theo loại. */
  allowedTypes: MediaType[] | null;
  initialSelectedIds: string[];
  multiple?: boolean;
  isLoading?: boolean;
  /**
   * Bật tab "Upload": file chọn/kéo thả chỉ được giữ ở trình duyệt, bấm Lưu mới tải lên Media rồi trả
   * id media thật. Tắt (mặc định) = popup chỉ chọn từ thư viện như trước.
   */
  allowUpload?: boolean;
  /** `uploadedMedia` = media vừa tạo/dùng lại từ tab Upload, để form thêm vào danh sách đang hiển thị. */
  onConfirm: (selectedIds: string[], uploadedMedia: ManagedMedia[]) => void;
  onClose: () => void;
};

/**
 * Modal chọn media dùng chung (đơn/đa chọn): Header (tab + tìm kiếm) – Body (lưới có cuộn) – Footer.
 * Tìm kiếm làm phía client trên `mediaOptions` mà form đã tải (listMedia() — Backend /media/public
 * tối đa 200 dòng). Thứ tự bấm chọn = thứ tự trả về (đa chọn).
 */
export function MediaPickerDialog({
  title,
  mediaOptions,
  allowedTypes,
  initialSelectedIds,
  multiple = false,
  isLoading = false,
  allowUpload = false,
  onConfirm,
  onClose,
}: MediaPickerDialogProps) {
  const [activeTab, setActiveTab] = useState("library");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const upload = useMediaPickerUpload(allowedTypes);

  const filteredMedia = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return mediaOptions.filter((media) => {
      if (allowedTypes && !allowedTypes.includes(media.type)) return false;
      if (!keyword) return true;
      return `${media.fileName} ${media.altText ?? ""}`.toLowerCase().includes(keyword);
    });
  }, [mediaOptions, allowedTypes, query]);

  const visibleMedia = filteredMedia.slice(0, visibleCount);
  const hiddenCount = filteredMedia.length - visibleMedia.length;

  function handleSelect(selectionKey: string) {
    setSaveError(null);
    if (!multiple) {
      setSelectedIds([selectionKey]);
      return;
    }

    setSelectedIds((previous) =>
      previous.includes(selectionKey) ? previous.filter((id) => id !== selectionKey) : [...previous, selectionKey],
    );
  }

  function handleFilesAdded(files: Iterable<File>) {
    const list = Array.from(files);
    const addedKeys = upload.addFiles(multiple ? list : list.slice(0, 1));
    if (addedKeys.length === 0) return;

    setSaveError(null);
    setSelectedIds((previous) => (multiple ? [...previous, ...addedKeys] : [addedKeys[0]]));
  }

  function handleRemovePending(key: string) {
    upload.removeItem(key);
    setSelectedIds((previous) => previous.filter((id) => id !== key));
  }

  async function handleSave() {
    const pendingKeys = selectedIds.filter((id) => id.startsWith(PENDING_UPLOAD_PREFIX));
    if (pendingKeys.length === 0) {
      onConfirm(selectedIds, []);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    const uploaded = await upload.uploadSelected(pendingKeys);
    setIsSaving(false);

    if (uploaded.size < pendingKeys.length) {
      // Giữ popup mở: file lỗi vẫn được chọn, bấm Lưu lần nữa chỉ thử lại file lỗi.
      setSaveError("Có file tải lên thất bại. Bỏ chọn file lỗi hoặc bấm Lưu để thử lại.");
      setActiveTab("upload");
      return;
    }

    const resolvedIds = selectedIds.map((id) => uploaded.get(id)?.id ?? id);
    onConfirm(Array.from(new Set(resolvedIds)), Array.from(uploaded.values()));
  }

  const canConfirm = !isSaving && (multiple || selectedIds.length > 0);
  const selectedCount = selectedIds.length;

  return (
    <BottomSheetDialog
      ariaLabel={title}
      onClose={isSaving ? () => undefined : onClose}
      panelClassName="h-[85svh] sm:max-w-[760px]"
    >
      {/* Header */}
      <div className="border-b border-brand-line px-5 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-black text-brand-greenDark">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Đóng"
            className="flex size-8 items-center justify-center rounded-lg text-brand-muted transition hover:bg-brand-green/10 hover:text-brand-greenDark disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {allowUpload && (
          <div className="mt-3">
            <Tabs tabs={PICKER_TABS} activeTab={activeTab} onChange={setActiveTab} />
          </div>
        )}

        {activeTab === "library" && (
          <div className="relative py-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Tìm kiếm ảnh theo tên..."
              aria-label="Tìm kiếm media theo tên"
              autoFocus
              className="h-10 w-full rounded-lg border border-brand-line pl-9 pr-3 text-[14px] outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
            />
          </div>
        )}
        {activeTab === "upload" && <div className="pb-3" />}
      </div>

      {/* Body: vùng duy nhất được cuộn trong modal (min-h-0 để flex-1 co lại được). */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {activeTab === "library" ? (
          isLoading ? (
            <div className="flex h-full items-center justify-center gap-2 text-[13px] text-brand-muted">
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              Đang tải thư viện media...
            </div>
          ) : filteredMedia.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-brand-muted">
              {mediaOptions.length === 0 ? "Chưa có file nào trong thư viện Media." : "Không tìm thấy media phù hợp."}
            </p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {visibleMedia.map((media) => (
                  <li key={media.id}>
                    <SelectableTile
                      isSelected={selectedIds.includes(media.id)}
                      order={multiple ? selectedIds.indexOf(media.id) + 1 : 0}
                      label={media.fileName}
                      onClick={() => handleSelect(media.id)}
                    >
                      <MediaThumb media={media} className="aspect-square w-full" />
                    </SelectableTile>
                  </li>
                ))}
              </ul>

              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((previous) => previous + PAGE_SIZE)}
                  className="mt-4 w-full rounded-lg border border-brand-line py-2 text-[13px] font-bold text-brand-greenDark transition hover:bg-brand-green/5"
                >
                  Xem thêm ({hiddenCount})
                </button>
              )}
            </>
          )
        ) : (
          <UploadPanel
            items={upload.items}
            selectedIds={selectedIds}
            multiple={multiple}
            accept={allowedTypes?.length === 1 && allowedTypes[0] === "image" ? IMAGE_UPLOAD_ACCEPT : MEDIA_UPLOAD_ACCEPT}
            isSaving={isSaving}
            onFilesAdded={handleFilesAdded}
            onToggle={handleSelect}
            onRemove={handleRemovePending}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-line px-5 py-3">
        <span className={cn("text-[12px]", saveError ? "font-medium text-brand-red" : "text-brand-muted")}>
          {saveError ?? (multiple ? `Đã chọn ${selectedCount}` : selectedCount > 0 ? "Đã chọn 1 ảnh" : "")}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-brand-line px-4 py-2 text-[13px] font-bold text-brand-muted transition hover:bg-brand-green/5 disabled:opacity-50"
          >
            {allowUpload ? "Cancel" : "Hủy"}
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-[13px] font-bold text-white transition hover:bg-brand-greenDark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            {isSaving ? "Đang tải lên..." : allowUpload ? "Lưu" : "Chọn"}
          </button>
        </div>
      </div>
    </BottomSheetDialog>
  );
}

type SelectableTileProps = {
  isSelected: boolean;
  /** Thứ tự chọn (đa chọn) hiển thị trên dấu tích; 0 = chỉ hiện dấu tích. */
  order: number;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function SelectableTile({ isSelected, order, label, disabled, onClick, children }: SelectableTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isSelected}
      className={cn(
        "relative flex w-full flex-col gap-2 rounded-lg border p-2 text-left transition disabled:cursor-not-allowed",
        isSelected
          ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green"
          : "border-brand-line hover:border-brand-green/60",
      )}
    >
      {children}
      <span className="truncate text-[12px] font-medium text-brand-ink">{label}</span>

      {isSelected && (
        <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-brand-green text-[11px] font-black text-white">
          {order > 0 ? order : <Check className="size-3.5" aria-hidden="true" />}
        </span>
      )}
    </button>
  );
}

type UploadPanelProps = {
  items: PendingUpload[];
  selectedIds: string[];
  multiple: boolean;
  accept: string;
  isSaving: boolean;
  onFilesAdded: (files: Iterable<File>) => void;
  onToggle: (key: string) => void;
  onRemove: (key: string) => void;
};

/** Tab Upload: chọn file / kéo thả. File chỉ nằm ở trình duyệt cho tới khi bấm Lưu. */
function UploadPanel({ items, selectedIds, multiple, accept, isSaving, onFilesAdded, onToggle, onRemove }: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Thả lệch ra ngoài vùng thả thì trình duyệt mở file đó và mất trang đang sửa.
  useEffect(() => {
    function preventFileNavigation(event: globalThis.DragEvent) {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    }
    window.addEventListener("dragover", preventFileNavigation);
    window.addEventListener("drop", preventFileNavigation);
    return () => {
      window.removeEventListener("dragover", preventFileNavigation);
      window.removeEventListener("drop", preventFileNavigation);
    };
  }, []);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!isSaving && event.dataTransfer.files.length > 0) onFilesAdded(event.dataTransfer.files);
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Chọn file hoặc kéo thả ảnh vào đây"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition",
          isDragging ? "border-brand-green bg-brand-green/5" : "border-brand-line hover:border-brand-green/60",
        )}
      >
        <UploadCloud className="size-8 text-brand-muted" aria-hidden="true" />
        <p className="text-[14px] font-bold text-brand-ink">Kéo thả ảnh vào đây hoặc bấm để chọn file</p>
        <p className="text-[12px] text-brand-muted">
          {accept.replaceAll(",", ", ")} · tối đa {MEDIA_UPLOAD_MAX_BYTES / (1024 * 1024)}MB/file
          {multiple ? " · chọn được nhiều file" : ""}
        </p>
        <p className="text-[12px] text-brand-muted">File chỉ được tải lên Media khi bấm Lưu.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) onFilesAdded(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.key);
            const isRejected = item.rejection !== null;

            return (
              <li key={item.key} className="relative">
                <SelectableTile
                  isSelected={isSelected}
                  order={multiple ? selectedIds.indexOf(item.key) + 1 : 0}
                  label={item.file.name}
                  disabled={isRejected || isSaving}
                  onClick={() => onToggle(item.key)}
                >
                  <span className="relative block aspect-square w-full overflow-hidden rounded bg-brand-cream">
                    {item.previewUrl ? (
                      // Blob URL cục bộ — next/image không tối ưu được nên dùng <img> thường.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.previewUrl} alt={item.file.name} className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-brand-muted">
                        <FileText className="size-1/3" aria-hidden="true" />
                      </span>
                    )}
                    {item.isUploading && (
                      <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <LoaderCircle className="size-6 animate-spin text-brand-green" aria-hidden="true" />
                      </span>
                    )}
                  </span>
                </SelectableTile>

                <p
                  className={cn(
                    "mt-1 text-[11px]",
                    item.rejection || item.error ? "flex items-start gap-1 text-brand-red" : "text-brand-muted",
                  )}
                >
                  {(item.rejection || item.error) && <AlertCircle className="mt-px size-3 shrink-0" aria-hidden="true" />}
                  {item.rejection ??
                    item.error ??
                    (item.media
                      ? item.isReused
                        ? "Đã có trong Media — dùng lại"
                        : "Đã tải lên Media"
                      : `${formatFileSize(item.file.size)} · chờ Lưu`)}
                </p>

                {!item.media && !isSaving && (
                  <button
                    type="button"
                    aria-label={`Bỏ ${item.file.name}`}
                    onClick={() => onRemove(item.key)}
                    className="absolute left-3 top-3 flex size-6 items-center justify-center rounded-full bg-white/90 text-brand-muted shadow transition hover:text-brand-red"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
