import { formatCurrency } from "@/lib/format-currency";

type MoneyDisplayProps = {
  value: number;
  className?: string;
};

/**
 * Wrapper hiển thị tiền tệ dùng chung — mọi nơi hiển thị số tiền phải qua
 * đây (bọc formatCurrency) thay vì tự gọi Intl.NumberFormat rải rác.
 */
export function MoneyDisplay({ value, className }: MoneyDisplayProps) {
  return <span className={`tabular-nums ${className ?? ""}`}>{formatCurrency(value)}</span>;
}
