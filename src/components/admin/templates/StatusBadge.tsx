export type EntityStatus = "active" | "inactive";

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
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${
        isActive
          ? "bg-brand-green/10 text-brand-greenDark"
          : "bg-brand-muted/10 text-brand-muted"
      }`}
    >
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}
