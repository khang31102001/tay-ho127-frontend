import { CheckCircle2 } from "lucide-react";

import type { ImportOutcome } from "./import-export.types";

type ImportResultProps<T> = {
  outcome: ImportOutcome<T>;
  /** Số dòng bị bỏ qua ngay từ bước preview vì không hợp lệ (không tính vào failures). */
  skippedCount: number;
};

export function ImportResult<T>({ outcome, skippedCount }: ImportResultProps<T>) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-brand-green/10 px-4 py-3 text-brand-greenDark">
        <CheckCircle2 className="size-5 shrink-0" />
        <span className="text-[14px] font-bold">
          {outcome.successCount} dòng đã được lưu thành công.
        </span>
      </div>

      {skippedCount > 0 && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
          {skippedCount} dòng bị bỏ qua ở bước kiểm tra vì không hợp lệ.
        </div>
      )}

      {outcome.failures.length > 0 && (
        <div className="space-y-1 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <p className="font-bold">{outcome.failures.length} dòng lưu thất bại:</p>
          <ul className="list-disc pl-4">
            {outcome.failures.map((failure, index) => (
              <li key={index}>{failure.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
