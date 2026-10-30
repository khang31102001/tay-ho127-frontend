export type PublishStatus = "draft" | "published" | "archived";

type PublishStatusBadgeProps = {
  status: PublishStatus;
};

const PUBLISH_STATUS_LABEL: Record<PublishStatus, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  archived: "Đã lưu trữ",
};

// Dùng token admin-* (không dùng brand-*): trong Admin, brand-green bị admin-theme.css trỏ sang màu primary xanh dương,
// khiến "Đã xuất bản" mất màu xanh lá và chìm vào nền hàng đang chọn của bảng.
const PUBLISH_STATUS_CLASS: Record<PublishStatus, { badge: string; dot: string }> = {
  draft: { badge: "border-admin-border bg-admin-subtle text-admin-textSecondary", dot: "bg-admin-muted" },
  published: {
    badge: "border-admin-success/50 bg-admin-success/10 text-admin-successText",
    dot: "bg-admin-success",
  },
  archived: {
    badge: "border-admin-warning/50 bg-admin-warning/10 text-admin-warningText",
    dot: "bg-admin-warning",
  },
};

/**
 * Badge trạng thái xuất bản dùng chung cho Page/Article (draft/published/archived).
 * Đặt cạnh StatusBadge (active/inactive) chứ không sửa nó — 2 domain giá trị khác nhau; hình thức giữ giống StatusBadge.
 */
export function PublishStatusBadge({ status }: PublishStatusBadgeProps) {
  const { badge, dot } = PUBLISH_STATUS_CLASS[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-admin-xs font-semibold ${badge}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dot}`} />
      {PUBLISH_STATUS_LABEL[status]}
    </span>
  );
}
