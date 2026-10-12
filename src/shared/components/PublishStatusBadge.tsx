export type PublishStatus = "draft" | "published" | "archived";

type PublishStatusBadgeProps = {
  status: PublishStatus;
};

const PUBLISH_STATUS_LABEL: Record<PublishStatus, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  archived: "Đã lưu trữ",
};

const PUBLISH_STATUS_CLASS: Record<PublishStatus, string> = {
  draft: "bg-brand-muted/10 text-brand-muted",
  published: "bg-brand-green/10 text-brand-greenDark",
  archived: "bg-red-50 text-red-600",
};

/**
 * Badge trạng thái xuất bản dùng chung cho Page/Article (draft/published/archived).
 * Đặt cạnh StatusBadge (active/inactive) chứ không sửa nó — 2 domain giá trị khác nhau.
 */
export function PublishStatusBadge({ status }: PublishStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${PUBLISH_STATUS_CLASS[status]}`}
    >
      {PUBLISH_STATUS_LABEL[status]}
    </span>
  );
}
