import Image from "next/image";

type ArticleCoverProps = {
  src: string | null;
  alt: string;
};

export function ArticleCover({ src, alt }: ArticleCoverProps) {
  if (!src) return null;

  return (
    <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-card border border-brand-line bg-brand-cream">
      <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 768px" className="object-cover" priority />
    </div>
  );
}
