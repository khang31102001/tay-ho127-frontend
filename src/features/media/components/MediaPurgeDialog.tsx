"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { StatusPopup } from "@/shared/components/StatusPopup";

import {
  getMediaUsages,
  MEDIA_PURGE_MAX_BATCH,
  purgeLibraryMedia,
  type MediaPurgeResult,
  type MediaUsage,
} from "../services/media-library.service";
import type { ManagedMedia } from "../types/media.types";
import { errorMessageOf } from "../utils/media-batch";

type MediaPurgeDialogProps = {
  /** Media cần xóa vĩnh viễn (1 hoặc nhiều). Rỗng = popup đóng. */
  media: ManagedMedia[];
  onClose: () => void;
  /** Gọi sau khi Backend xử lý xong (kể cả khi chỉ xóa được một phần) để màn gọi tải lại dữ liệu. */
  onFinished: (deletedIds: string[]) => void;
};

type Phase = "confirm" | "done";

function UsageList({ usages }: { usages: MediaUsage[] }) {
  return (
    <ul className="mt-1 space-y-0.5 text-[12px] text-brand-muted">
      {usages.map((usage) => (
        <li key={`${usage.module}-${usage.entityId}-${usage.field}`}>
          • {usage.module}: <span className="font-medium text-brand-ink">{usage.entityName}</span> ({usage.field})
        </li>
      ))}
    </ul>
  );
}

/**
 * Xác nhận + kết quả xóa vĩnh viễn media. Quy tắc xóa: nơi đang dùng media (sản phẩm, banner, bài viết...) tự được gỡ ảnh,
 * không chặn. Chỉ ảnh chèn trong nội dung HTML (canDetach = false) mới chặn và phải gỡ tay.
 */
export function MediaPurgeDialog({ media, onClose, onFinished }: MediaPurgeDialogProps) {
  const isSingle = media.length === 1;
  const singleId = isSingle ? media[0].id : null;
  const [phase, setPhase] = useState<Phase>("confirm");
  const [usages, setUsages] = useState<MediaUsage[] | null>(null);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [results, setResults] = useState<MediaPurgeResult[]>([]);
  const [purgeError, setPurgeError] = useState<string | null>(null);

  useEffect(() => {
    if (!singleId) return;
    let isCancelled = false;
    getMediaUsages(singleId)
      .then((found) => !isCancelled && setUsages(found))
      .catch((error: unknown) => !isCancelled && setUsageError(errorMessageOf(error, "Không kiểm tra được nơi đang dùng media.")));
    return () => {
      isCancelled = true;
    };
  }, [singleId]);

  async function handleConfirm() {
    setPurgeError(null);
    const ids = media.map((item) => item.id);
    const collected: MediaPurgeResult[] = [];
    for (let start = 0; start < ids.length; start += MEDIA_PURGE_MAX_BATCH) {
      const response = await purgeLibraryMedia(ids.slice(start, start + MEDIA_PURGE_MAX_BATCH));
      collected.push(...response.results);
    }

    setResults(collected);
    setPhase("done");
    onFinished(collected.filter((result) => result.status === "deleted").map((result) => result.id));
  }

  const isCheckingUsages = isSingle && usages === null && usageError === null;
  const blockingUsages = (usages ?? []).filter((usage) => usage.canDetach === false);
  const detachableUsages = (usages ?? []).filter((usage) => usage.canDetach !== false);
  const isBlocked = isSingle && blockingUsages.length > 0;
  const hasDetachable = isSingle && detachableUsages.length > 0;
  const deleted = results.filter((result) => result.status === "deleted");
  const skipped = results.filter((result) => result.status !== "deleted");
  const detachedCount = deleted.reduce((total, result) => total + result.usages.length, 0);

  if (phase === "done") {
    return (
      <StatusPopup
        open
        status={skipped.length === 0 ? "success" : deleted.length === 0 ? "error" : "warning"}
        title={`Đã xóa vĩnh viễn ${deleted.length}/${results.length} media`}
        description={
          skipped.length > 0
            ? "Các media dưới đây chưa được xóa:"
            : detachedCount > 0
              ? `File đã bị xóa khỏi nơi lưu và thư viện; đã gỡ ảnh khỏi ${detachedCount} nơi đang dùng.`
              : "File đã bị xóa khỏi nơi lưu và thư viện."
        }
        onOpenChange={(open) => !open && onClose()}
        actions={[{ id: "close", label: "Đóng", variant: "secondary" }]}
      >
        {skipped.length > 0 && (
          <ul className="max-h-[50svh] space-y-2 overflow-y-auto text-left text-[13px]">
            {skipped.map((result) => (
              <li key={result.id} className="rounded-lg border border-brand-line px-3 py-2">
                <p className="font-bold text-brand-ink">{result.fileName ?? result.id}</p>
                <p className="text-[12px] text-brand-red">{result.message}</p>
                {result.usages.length > 0 && <UsageList usages={result.usages} />}
              </li>
            ))}
          </ul>
        )}
      </StatusPopup>
    );
  }

  return (
    <StatusPopup
      open
      status={isBlocked ? "error" : "warning"}
      title={isSingle ? `Xóa vĩnh viễn "${media[0].fileName}"?` : `Xóa vĩnh viễn ${media.length} media?`}
      description={
        isBlocked
          ? "Ảnh đang được chèn trong nội dung (HTML) nên không tự gỡ được. Hãy xóa ảnh khỏi nội dung ở các nơi bên dưới rồi thử lại."
          : hasDetachable
            ? "Media đang được dùng. Khi xóa, các nơi bên dưới sẽ tự bỏ ảnh này. Hành động này không thể hoàn tác."
            : "File sẽ bị xóa khỏi nơi lưu (Server/Cloud) và khỏi thư viện. Hành động này không thể hoàn tác."
      }
      onOpenChange={(open) => !open && onClose()}
      onActionError={(error) => setPurgeError(errorMessageOf(error, "Xóa vĩnh viễn thất bại, vui lòng thử lại."))}
      actions={[
        { id: "cancel", label: "Hủy", variant: "secondary" },
        {
          id: "confirm",
          label: "Xóa vĩnh viễn",
          variant: "danger",
          disabled: isCheckingUsages || isBlocked,
          closeAfterClick: false,
          onClick: handleConfirm,
        },
      ]}
    >
      <div className="text-left text-[13px]">
        {isCheckingUsages && (
          <p className="flex items-center gap-2 text-brand-muted">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Đang kiểm tra nơi đang dùng media...
          </p>
        )}
        {usageError && <p className="text-brand-red">{usageError} Backend vẫn kiểm tra lại khi xóa.</p>}
        {usages && usages.length > 0 && <UsageList usages={usages} />}
        {purgeError && <p className="mt-2 font-medium text-brand-red">{purgeError}</p>}
        {!isSingle && (
          <p className="text-brand-muted">
            Media đang được dùng (sản phẩm, bài viết, banner...) sẽ tự được gỡ khỏi các nơi đó. Ảnh chèn trong nội dung HTML sẽ được bỏ qua và liệt kê sau khi xóa.
          </p>
        )}
      </div>
    </StatusPopup>
  );
}
