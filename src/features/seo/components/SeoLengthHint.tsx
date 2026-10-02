type SeoLengthHintProps = {
  value: string;
  min: number;
  max: number;
};

/**
 * Task 15 — validation cơ bản dạng WARNING (không chặn save), chỉ cảnh báo
 * quá ngắn/quá dài cho Meta Title/Description.
 */
export function SeoLengthHint({ value, min, max }: SeoLengthHintProps) {
  const length = value.trim().length;

  if (length === 0) {
    return <p className="mt-1 text-[12px] text-brand-muted">Để trống sẽ tự lấy giá trị mặc định.</p>;
  }

  if (length < min) {
    return <p className="mt-1 text-[12px] font-medium text-amber-600">Hơi ngắn ({length} ký tự, nên ≥ {min}).</p>;
  }

  if (length > max) {
    return <p className="mt-1 text-[12px] font-medium text-amber-600">Hơi dài ({length} ký tự, nên ≤ {max}) — có thể bị cắt bớt khi hiển thị.</p>;
  }

  return <p className="mt-1 text-[12px] text-brand-green">Độ dài phù hợp ({length} ký tự).</p>;
}
