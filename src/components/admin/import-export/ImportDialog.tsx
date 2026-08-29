"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileUp, LoaderCircle, Upload, X } from "lucide-react";

import { ImportPreviewTable } from "./ImportPreviewTable";
import { ImportResult } from "./ImportResult";
import { parseCsv } from "./csv";
import type { ImportConfig, ImportOutcome, ImportRowResult } from "./import-export.types";

type ImportDialogProps<T> = {
  title: string;
  triggerLabel?: string;
  config: ImportConfig<T>;
};

type ImportStep = "pick" | "preview" | "result";

/**
 * Dialog Import dùng chung cho mọi màn Admin — nhận `config` (cột, parse,
 * validate, cách lưu) từ domain, không tự biết business logic của domain nào.
 */
export function ImportDialog<T>({ title, triggerLabel = "Nhập file", config }: ImportDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>("pick");
  const [results, setResults] = useState<ImportRowResult<T>[]>([]);
  const [outcome, setOutcome] = useState<ImportOutcome<T> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setStep("pick");
    setResults([]);
    setOutcome(null);
    setParseError(null);
  }

  function closeDialog() {
    setOpen(false);
    resetState();
  }

  async function handleFileSelected(file: File) {
    setParseError(null);

    try {
      const text = await file.text();
      const { rows } = parseCsv(text);

      if (rows.length === 0) {
        setParseError("File không có dữ liệu.");
        return;
      }

      const parsedResults: ImportRowResult<T>[] = rows.map((raw, rowIndex) => {
        const parsed: Partial<T> = {};
        const errors: string[] = [];

        config.columns.forEach((column) => {
          const rawValue = raw[column.header] ?? "";

          if (column.required && rawValue.trim() === "") {
            errors.push(`Thiếu "${column.header}"`);
            return;
          }

          const value = column.parse ? column.parse(rawValue, raw) : rawValue;
          const validationError = column.validate?.(value, raw) ?? null;

          if (validationError) {
            errors.push(validationError);
            return;
          }

          (parsed as Record<string, unknown>)[column.key] = value;
        });

        return {
          rowIndex,
          raw,
          parsed,
          errors,
          status: errors.length > 0 ? "invalid" : "valid",
        };
      });

      setResults(parsedResults);
      setStep("preview");
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Không đọc được file.");
    }
  }

  async function handleConfirmImport() {
    const validRows = results
      .filter((result) => result.status === "valid")
      .map((result) => result.parsed);

    if (validRows.length === 0) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await config.onImport(validRows);
      setOutcome(result);
      setStep("result");
    } finally {
      setIsProcessing(false);
    }
  }

  const validCount = results.filter((result) => result.status === "valid").length;
  const invalidCount = results.length - validCount;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line bg-white px-4 py-2.5 text-[14px] font-bold text-brand-greenDark transition hover:bg-brand-green/5"
      >
        <Upload className="size-4" />
        {triggerLabel}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[9998] flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-[2px]">
            <div className="relative w-full max-w-3xl rounded-2xl border border-brand-line bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-brand-line px-6 py-4">
                <h2 className="text-[16px] font-black text-brand-greenDark">{title}</h2>

                <button
                  type="button"
                  aria-label="Đóng"
                  onClick={closeDialog}
                  className="flex size-8 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                {step === "pick" && (
                  <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-brand-line px-6 py-10 text-center">
                    <FileUp className="size-8 text-brand-muted" aria-hidden="true" />
                    <p className="text-[14px] text-brand-muted">
                      Chọn file CSV để nhập dữ liệu hàng loạt.
                    </p>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-brand-green px-4 py-2 text-[14px] font-bold text-white transition hover:opacity-90"
                    >
                      Chọn file...
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          handleFileSelected(file);
                        }

                        event.target.value = "";
                      }}
                    />

                    {parseError && (
                      <p className="text-[13px] font-bold text-red-600">{parseError}</p>
                    )}
                  </div>
                )}

                {step === "preview" && (
                  <div className="space-y-3">
                    <p className="text-[13px] text-brand-muted">
                      {validCount} dòng hợp lệ
                      {invalidCount > 0 ? `, ${invalidCount} dòng lỗi sẽ bị bỏ qua` : ""}.
                    </p>

                    <ImportPreviewTable columns={config.columns} results={results} />
                  </div>
                )}

                {step === "result" && outcome && (
                  <ImportResult outcome={outcome} skippedCount={invalidCount} />
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-brand-line px-6 py-4">
                {step === "preview" && (
                  <>
                    <button
                      type="button"
                      onClick={resetState}
                      className="rounded-lg border border-brand-line px-4 py-2 text-[14px] font-bold text-brand-muted transition hover:bg-brand-cream"
                    >
                      Chọn file khác
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      disabled={isProcessing || validCount === 0}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-4 py-2 text-[14px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing && <LoaderCircle className="size-4 animate-spin" />}
                      Nhập {validCount} dòng
                    </button>
                  </>
                )}

                {step === "result" && (
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="rounded-lg bg-brand-green px-4 py-2 text-[14px] font-bold text-white transition hover:opacity-90"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
