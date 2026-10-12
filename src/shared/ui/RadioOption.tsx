import {

  type ReactNode,
} from "react";

interface RadioOptionProps<T extends string> {
  name: string;
  value: T;
  checked: boolean;
  label: ReactNode;
  onChange: (value: T) => void;
}
export function RadioOption<T extends string>({
  name,
  value,
  checked,
  label,
  onChange,
}: RadioOptionProps<T>) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-3 w-3 accent-[#0f9b55]"
      />

      <span>{label}</span>
    </label>
  );
}