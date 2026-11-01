"use client";

import { useRef, useState } from "react";

import type { ManagedMedia, MediaType } from "../types/media.types";
import { createLibraryMedia } from "../services/media-library.service";
import {
  MEDIA_ALT_TEXT_MAX_LENGTH,
  MEDIA_BATCH_CONCURRENCY,
  MEDIA_FILE_NAME_MAX_LENGTH,
  MEDIA_URL_MAX_LENGTH,
  errorMessageOf,
  fileNameFromUrl,
  inferMediaType,
  isSupportedMediaUrl,
  parseUrlList,
  runWithConcurrency,
} from "../utils/media-batch";

import type { MediaBatchStatus } from "./useMediaBulkUpload";
import { useWarnBeforeUnload } from "./useWarnBeforeUnload";

/** Một dòng = một bản ghi CreateMediaRequest (cùng các trường của form "Nhập URL" cũ). */
export type MediaUrlImportRow = {
  key: string;
  url: string;
  fileName: string;
  type: MediaType;
  /** Dung lượng (byte) — không đọc được từ URL nên mặc định 0 như form cũ, người dùng sửa nếu biết. */
  size: number;
  altText: string;
  status: MediaBatchStatus;
  error?: string;
  media?: ManagedMedia;
};

export type MediaUrlRowField = "url" | "fileName" | "type" | "size" | "altText";
export type MediaUrlRowErrors = Partial<Record<MediaUrlRowField, string>>;

/** Kiểm tra theo CreateMediaRequestValidator + URL không trùng trong cùng đợt nhập. */
export function getUrlRowErrors(row: MediaUrlImportRow, rows: MediaUrlImportRow[]): MediaUrlRowErrors {
  const errors: MediaUrlRowErrors = {};
  const url = row.url.trim();
  const fileName = row.fileName.trim();

  if (!url) errors.url = "Bắt buộc nhập URL.";
  else if (url.length > MEDIA_URL_MAX_LENGTH) errors.url = `URL tối đa ${MEDIA_URL_MAX_LENGTH} ký tự.`;
  else if (!isSupportedMediaUrl(url)) errors.url = "URL phải bắt đầu bằng https://, http:// hoặc /.";
  else if (rows.findIndex((other) => other.url.trim() === url) < rows.indexOf(row)) {
    errors.url = "URL bị trùng với dòng phía trên.";
  }

  if (!fileName) errors.fileName = "Bắt buộc nhập tên file.";
  else if (fileName.length > MEDIA_FILE_NAME_MAX_LENGTH) errors.fileName = `Tên file tối đa ${MEDIA_FILE_NAME_MAX_LENGTH} ký tự.`;

  if (!Number.isInteger(row.size) || row.size < 0) errors.size = "Dung lượng phải là số nguyên ≥ 0.";

  if (row.altText.length > MEDIA_ALT_TEXT_MAX_LENGTH) errors.altText = `Alt text tối đa ${MEDIA_ALT_TEXT_MAX_LENGTH} ký tự.`;

  return errors;
}

function hasErrors(errors: MediaUrlRowErrors) {
  return Object.keys(errors).length > 0;
}

function isEditable(row: MediaUrlImportRow) {
  return row.status === "pending" || row.status === "error";
}

export function useMediaUrlImport() {
  const [rows, setRows] = useState<MediaUrlImportRow[]>([]);
  const [rawText, setRawText] = useState("");
  /** Chỉ tô đỏ ô thiếu sau lần bấm Lưu đầu tiên, tránh báo lỗi khi người dùng chưa kịp điền. */
  const [isValidationVisible, setIsValidationVisible] = useState(false);
  const [notice, setNotice] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const nextKeyRef = useRef(0);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const isSaving = rows.some((row) => row.status === "processing");
  useWarnBeforeUnload(isSaving);

  function updateRow(key: string, patch: Partial<MediaUrlImportRow>) {
    setRows((previous) => previous.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  /** Tách danh sách URL đã dán thành các dòng; URL đã có trong danh sách được bỏ qua. */
  function addUrlsFromText() {
    const existing = new Set(rowsRef.current.map((row) => row.url.trim()));
    const added: MediaUrlImportRow[] = [];
    let skipped = 0;

    for (const url of parseUrlList(rawText)) {
      if (existing.has(url)) {
        skipped += 1;
        continue;
      }
      existing.add(url);
      nextKeyRef.current += 1;
      const fileName = fileNameFromUrl(url);
      added.push({
        key: `url-${nextKeyRef.current}`,
        url,
        fileName,
        type: inferMediaType(fileName || url),
        size: 0,
        altText: "",
        status: "pending",
      });
    }

    setRows((previous) => [...previous, ...added]);
    setRawText("");
    setNotice({
      tone: "info",
      text:
        added.length === 0 && skipped === 0
          ? "Chưa có URL nào. Dán mỗi URL trên một dòng."
          : `Đã thêm ${added.length} URL${skipped > 0 ? `, bỏ qua ${skipped} URL đã có trong danh sách` : ""}.`,
    });
  }

  function updateField<K extends MediaUrlRowField>(key: string, field: K, value: MediaUrlImportRow[K]) {
    updateRow(key, { [field]: value } as Partial<MediaUrlImportRow>);
  }

  function removeRow(key: string) {
    setRows((previous) => previous.filter((row) => row.key !== key || row.status === "processing"));
  }

  /** Áp dụng giá trị chung cho mọi dòng chưa lưu (dòng đã lưu giữ nguyên). */
  function applyToAll(patch: Partial<Pick<MediaUrlImportRow, "altText" | "type">>) {
    setRows((previous) => previous.map((row) => (isEditable(row) ? { ...row, ...patch } : row)));
  }

  async function saveRows(targets: MediaUrlImportRow[]) {
    if (targets.length === 0) return;

    const allRows = rowsRef.current;
    const invalidCount = targets.filter((row) => hasErrors(getUrlRowErrors(row, allRows))).length;
    if (invalidCount > 0) {
      setIsValidationVisible(true);
      setNotice({
        tone: "error",
        text: `Còn ${invalidCount} dòng thiếu hoặc sai thông tin — vui lòng bổ sung các ô được đánh dấu đỏ.`,
      });
      return;
    }

    setNotice(null);
    const targetKeys = new Set(targets.map((row) => row.key));
    setRows((previous) =>
      previous.map((row) => (targetKeys.has(row.key) ? { ...row, status: "processing", error: undefined } : row)),
    );

    await runWithConcurrency(targets, MEDIA_BATCH_CONCURRENCY, async (row) => {
      try {
        const media = await createLibraryMedia({
          url: row.url.trim(),
          fileName: row.fileName.trim(),
          type: row.type,
          size: row.size,
          altText: row.altText.trim(),
        });
        updateRow(row.key, { status: "success", media });
      } catch (error) {
        updateRow(row.key, { status: "error", error: errorMessageOf(error, "Tạo media thất bại.") });
      }
    });
  }

  function saveAll() {
    if (isSaving) return Promise.resolve();
    return saveRows(rowsRef.current.filter(isEditable));
  }

  function retryRow(key: string) {
    const target = rowsRef.current.find((row) => row.key === key);
    return target && isEditable(target) ? saveRows([target]) : Promise.resolve();
  }

  function clearSaved() {
    setRows((previous) => previous.filter((row) => row.status !== "success"));
  }

  const summary = {
    total: rows.length,
    pending: rows.filter((row) => row.status === "pending").length,
    processing: rows.filter((row) => row.status === "processing").length,
    success: rows.filter((row) => row.status === "success").length,
    failed: rows.filter((row) => row.status === "error").length,
  };

  return {
    rows,
    rawText,
    setRawText,
    notice,
    summary,
    isSaving,
    isValidationVisible,
    addUrlsFromText,
    updateField,
    removeRow,
    applyToAll,
    saveAll,
    retryRow,
    clearSaved,
  };
}
