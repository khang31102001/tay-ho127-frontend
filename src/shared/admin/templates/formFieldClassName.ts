/**
 * Class dùng chung cho input/select/textarea/nút trong mọi màn Admin (Editor field, toolbar Explorer, dialog...)
 * — đọc token `admin-*` (src/styles/tokens.css) để giữ giao diện ERP nhất quán mà không khai báo lại ở từng domain.
 */
export const adminFieldInputClassName =
  "mt-1.5 min-h-admin-control w-full rounded-admin border border-admin-border bg-admin-surface px-3 py-1.5 text-admin-base text-admin-text outline-none transition-colors duration-admin placeholder:text-admin-muted focus:border-admin-focus focus:ring-2 focus:ring-admin-focus/30 disabled:cursor-not-allowed disabled:bg-admin-disabled";

export const adminFieldLabelClassName = "block text-admin-sm font-bold text-admin-text";

/** Control cao bằng nút trên toolbar (select lọc, ô ngày...), không có margin-top như field trong form. */
export const adminControlClassName =
  "h-admin-control rounded-admin border border-admin-border bg-admin-surface px-3 text-admin-base text-admin-text outline-none transition-colors duration-admin placeholder:text-admin-muted focus:border-admin-focus focus:ring-2 focus:ring-admin-focus/30 disabled:cursor-not-allowed disabled:bg-admin-disabled";

const adminButtonBaseClassName =
  "inline-flex h-admin-control shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-admin border px-3 text-admin-base font-semibold outline-none transition-colors duration-admin focus-visible:ring-2 focus-visible:ring-admin-focus/50 disabled:cursor-not-allowed disabled:opacity-60";

/** Biến thể nút Admin: primary = hành động chính (Tạo mới, Lưu); outline = hành động phụ nhấn mạnh (Tiện ích, Nhập file); secondary = trung tính (Nâng cao, Hủy). */
export const adminButtonClassName = {
  primary: `${adminButtonBaseClassName} border-admin-primary bg-admin-primary text-white hover:border-admin-primaryHover hover:bg-admin-primaryHover`,
  outline: `${adminButtonBaseClassName} border-admin-primary bg-admin-surface text-admin-primary hover:bg-admin-primaryLight`,
  secondary: `${adminButtonBaseClassName} border-admin-textSecondary bg-admin-surface text-admin-text hover:bg-admin-subtle`,
  danger: `${adminButtonBaseClassName} border-admin-danger bg-admin-danger text-white hover:opacity-90`,
} as const;

/** Một dòng trong menu thả xuống (vd. menu "Tiện ích" của Explorer). */
export const adminMenuItemClassName =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-admin-base text-admin-text outline-none transition-colors duration-admin hover:bg-admin-primaryLight focus-visible:bg-admin-primaryLight disabled:cursor-not-allowed disabled:opacity-60";
