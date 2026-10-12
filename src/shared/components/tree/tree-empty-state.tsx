type TreeEmptyStateProps = {
  message?: string;
};

export function TreeEmptyState({ message = "Không có dữ liệu." }: TreeEmptyStateProps) {
  return <p className="py-6 text-center text-[13px] text-brand-muted">{message}</p>;
}
