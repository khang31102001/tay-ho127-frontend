"use client";

import { useState } from "react";

import type { ManagedMedia } from "../types/media.types";

/**
 * Danh sách media cho MediaPicker khi popup có tab "Upload": media vừa tải lên được thêm vào
 * đầu danh sách (hiển thị ngay, không phải tải lại thư viện). Dùng chung cho mọi form chọn ảnh —
 * truyền `mediaOptions` cho picker và `addUploadedMedia` vào `onMediaUploaded`.
 */
export function useMediaOptionsWithUploads(libraryMedia: ManagedMedia[]) {
  const [uploadedMedia, setUploadedMedia] = useState<ManagedMedia[]>([]);

  const mediaOptions = [
    ...uploadedMedia.filter((media) => !libraryMedia.some((existing) => existing.id === media.id)),
    ...libraryMedia,
  ];

  function addUploadedMedia(media: ManagedMedia[]) {
    setUploadedMedia((previous) => [...media.filter((item) => !previous.some((p) => p.id === item.id)), ...previous]);
  }

  return { mediaOptions, addUploadedMedia };
}
