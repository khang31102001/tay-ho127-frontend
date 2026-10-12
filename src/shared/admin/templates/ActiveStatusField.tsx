import { adminFieldInputClassName, adminFieldLabelClassName } from "./formFieldClassName";

type ActiveStatusFieldProps = {
  isActive: boolean;
  onChange: (isActive: boolean) => void;
  inactiveLabel?: string;
};

/** Field "Trạng thái" cho mọi Editor Admin có cờ isActive (Backend) — thay cho khối select lặp ở từng feature. */
export function ActiveStatusField({ isActive, onChange, inactiveLabel = "Ngừng hoạt động" }: ActiveStatusFieldProps) {
  return (
    <label className={adminFieldLabelClassName}>
      Trạng thái
      <select
        value={isActive ? "active" : "inactive"}
        onChange={(event) => onChange(event.target.value === "active")}
        className={adminFieldInputClassName}
      >
        <option value="active">Hoạt động</option>
        <option value="inactive">{inactiveLabel}</option>
      </select>
    </label>
  );
}
