/**
 * Class dùng chung cho input/select/textarea trong mọi Editor field của Admin
 * (MenuItemEditor, UserEditor, RoleEditor, ...) — giữ Brand Style nhất quán
 * (brand-line, brand-green focus ring) mà không phải khai báo lại ở từng domain.
 */
export const adminFieldInputClassName =
  "mt-1.5 h-10 w-full rounded-lg border border-brand-line px-4 text-[14px] outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

export const adminFieldLabelClassName = "block text-[13px] font-bold text-brand-greenDark";
