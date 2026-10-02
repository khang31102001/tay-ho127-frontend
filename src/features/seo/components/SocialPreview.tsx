import Image from "next/image";

type SocialPreviewProps = {
  imageUrl: string | null;
  title: string;
  description: string;
  url: string;
};

/** Task 14 — Social Preview (Facebook/Zalo card style), presentational thuần. */
export function SocialPreview({ imageUrl, title, description, url }: SocialPreviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-brand-line bg-white">
      <p className="border-b border-brand-line bg-brand-cream/40 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-brand-muted">
        Social Preview
      </p>

      <div className="relative aspect-[1.91/1] w-full bg-brand-cream">
        {imageUrl ? (
          <Image src={imageUrl} alt={title || "Ảnh chia sẻ"} fill className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-[12px] text-brand-muted">
            Chưa có ảnh OG
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-[11px] uppercase text-brand-muted">{url}</p>
        <p className="mt-0.5 truncate text-[14px] font-bold text-brand-ink">{title || "(chưa có tiêu đề)"}</p>
        <p className="mt-0.5 line-clamp-2 text-[12.5px] text-brand-muted">{description || "(chưa có mô tả)"}</p>
      </div>
    </div>
  );
}
