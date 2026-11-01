"use client";

import { useAsyncData } from "@/shared/hooks/useAsyncData";

import { getMediaStorageOptions } from "../services/media-library.service";

/** Nơi lưu chọn được ở màn Thêm media — tải 1 lần khi mở màn. */
export function useMediaStorageOptions() {
  return useAsyncData(getMediaStorageOptions, [], { fallbackError: "Không tải được danh sách nơi lưu." });
}
