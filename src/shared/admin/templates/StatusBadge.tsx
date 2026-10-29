export type EntityStatus = "active" | "inactive";

/** Backend trả trạng thái dạng `isActive: boolean` — quy đổi về EntityStatus để hiển thị. */
export function statusFromIsActive(isActive: boolean): EntityStatus {
  return isActive ? "active" : "inactive";
}

type StatusBadgeProps = {
  status: EntityStatus;
  activeLabel?: string;
  inactiveLabel?: string;
};

/**
 * Badge trạng thái dùng chung cho mọi domain Admin có field status
 * (User, Role, ...). Không đoán field — domain tự map status của mình
 * về "active" | "inactive" trước khi truyền vào.
 */
export function StatusBadge({
  status,
  activeLabel = "Hoạt động",
  inactiveLabel = "Ngừng hoạt động",
}: StatusBadgeProps) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-admin-xs font-semibold ${
        isActive
          ? "border-admin-success/50 bg-admin-success/10 text-admin-successText"
          : "border-admin-border bg-admin-subtle text-admin-textSecondary"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${isActive ? "bg-admin-success" : "bg-admin-muted"}`}
      />
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}
