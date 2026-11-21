"use client";

import { useState } from "react";

import { RichTextEditor, type RichTextImage } from "@/shared/ui/RichTextEditor";

import type { MediaCategoryCode } from "../types/media-category.types";
import type { ManagedMedia } from "../types/media.types";
import { MediaPickerDialog } from "./MediaPickerDialog";

type MediaRichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxWords?: number;
  mediaOptions: ManagedMedia[];
  isLoadingMedia?: boolean;
  /** Nhóm kho ảnh của form (vd. articles) — popup lọc sẵn theo nhóm và ảnh upload từ editor vào nhóm này. */
  category: MediaCategoryCode;
  /** Media vừa tải lên từ popup — form thêm vào `mediaOptions` để lần mở sau thấy ngay. */
  onMediaUploaded?: (media: ManagedMedia[]) => void;
};

/** Chỉ ảnh có URL http(s) mới chèn được vào HTML (whitelist sanitize); ảnh mẫu đường dẫn tương đối bị ẩn. */
function isInsertableImage(media: ManagedMedia) {
  return media.type === "image" && /^https?:\/\/\S+$/i.test(media.url);
}

function toRichTextImage(media: ManagedMedia): RichTextImage {
  return { src: media.url, alt: media.altText ?? media.fileName.replace(/\.[^.]+$/, "") };
}

/**
 * RichTextEditor có nút Hình ảnh mở popup Media (chọn ảnh có sẵn hoặc upload, chọn được nhiều ảnh). Ảnh chỉ được
 * chèn bằng URL — nội dung HTML KHÔNG lưu id media, nên không tạo liên kết nào ngoài chính đường dẫn ảnh.
 * Chèn ảnh bằng link ngoài vẫn có ở menu Chèn → "Hình ảnh từ URL".
 */
export function MediaRichTextEditor({
  mediaOptions,
  isLoadingMedia,
  category,
  onMediaUploaded,
  ...editorProps
}: MediaRichTextEditorProps) {
  // Hàm chèn do editor đưa ra mỗi lần bấm nút Hình ảnh; có giá trị = popup đang mở.
  const [insertImages, setInsertImages] = useState<((images: RichTextImage[]) => void) | null>(null);

  function handleConfirm(selectedIds: string[], uploadedMedia: ManagedMedia[]) {
    const mediaById = new Map([...uploadedMedia, ...mediaOptions].map((media) => [media.id, media]));
    const images = selectedIds
      .map((id) => mediaById.get(id))
      .filter((media): media is ManagedMedia => media !== undefined && isInsertableImage(media))
      .map(toRichTextImage);

    if (uploadedMedia.length > 0) onMediaUploaded?.(uploadedMedia);
    if (images.length > 0) insertImages?.(images);
    setInsertImages(null);
  }

  return (
    <>
      <RichTextEditor {...editorProps} onRequestImage={(insert) => setInsertImages(() => insert)} />

      {insertImages && (
        <MediaPickerDialog
          title="Chèn ảnh vào nội dung"
          mediaOptions={mediaOptions.filter(isInsertableImage)}
          allowedTypes={["image"]}
          initialSelectedIds={[]}
          multiple
          allowUpload
          category={category}
          isLoading={isLoadingMedia}
          onClose={() => setInsertImages(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
