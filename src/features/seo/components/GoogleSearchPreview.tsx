type GoogleSearchPreviewProps = {
  title: string;
  url: string;
  description: string;
};

/** Task 14 — Google Search Preview, presentational thuần, không gọi API. */
export function GoogleSearchPreview({ title, url, description }: GoogleSearchPreviewProps) {
  return (
    <div className="rounded-lg border border-brand-line bg-white p-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-brand-muted">Google Search Preview</p>
      <p className="truncate text-[14px] text-[#202124]">{url}</p>
      <p className="mt-0.5 truncate text-[18px] text-[#1a0dab]">{title || "(chưa có tiêu đề)"}</p>
      <p className="mt-0.5 line-clamp-2 text-[13px] text-[#4d5156]">{description || "(chưa có mô tả)"}</p>
    </div>
  );
}
