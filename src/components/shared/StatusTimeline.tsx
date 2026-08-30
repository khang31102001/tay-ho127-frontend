export type StatusTimelineEntry = {
  label: string;
  timestamp: string;
  changedBy?: string;
  note?: string;
};

type StatusTimelineProps = {
  entries: StatusTimelineEntry[];
};

/**
 * Timeline dạng generic (label/timestamp/changedBy/note) — không biết gì về
 * OrderStatus/PaymentStatus, domain tự map dữ liệu của mình về shape này.
 */
export function StatusTimeline({ entries }: StatusTimelineProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-brand-muted">Chưa có lịch sử.</p>;
  }

  return (
    <ol className="space-y-4">
      {entries.map((entry, index) => (
        <li key={`${entry.timestamp}-${index}`} className="relative pl-6">
          <span
            className={`absolute left-0 top-1.5 size-2.5 rounded-full ${
              index === entries.length - 1 ? "bg-brand-red" : "bg-brand-line"
            }`}
          />
          {index < entries.length - 1 && (
            <span className="absolute left-[4.5px] top-4 h-full w-px bg-brand-line" />
          )}
          <p className="text-sm font-semibold text-brand-ink">{entry.label}</p>
          <p className="mt-0.5 text-xs text-brand-muted">
            {new Date(entry.timestamp).toLocaleString("vi-VN")}
            {entry.changedBy ? ` · ${entry.changedBy}` : ""}
          </p>
          {entry.note && <p className="mt-1 text-xs text-brand-muted">{entry.note}</p>}
        </li>
      ))}
    </ol>
  );
}
