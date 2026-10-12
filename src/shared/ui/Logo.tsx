// Import Image của Next để tối ưu ảnh logo trong public.
import Image from "next/image";
// Import Link để logo bấm về trang chủ.
import Link from "next/link";
// Import dữ liệu site tập trung.
import { site } from "../../core/config/site-data";

// Logo component nhận tone để dùng đúng ảnh màu/trắng theo nền.
type LogoProps = {
  tone?: "color" | "white";
  className?: string;
};

export function Logo({ tone = "color", className = "h-auto w-44" }: LogoProps) {
  // Chọn logo trắng cho nền tối, logo màu cho nền sáng.
  const src = tone === "white" ? site.assets.logoWhite : site.assets.logoColor;

  // Render logo có aria-label rõ nghĩa.
  return (
    <Link href="/" aria-label="Về trang chủ Bánh Cuốn Tây Hồ 127" className="focus-ring inline-flex rounded-xl">
      <Image src={src} alt={site.name} width={260} height={116} priority className={className} />
    </Link>
  );
}
