// Import Link của Next để chuyển trang không reload toàn bộ web.
import Link from "next/link";
// Import helper nối class dùng chung.
import { cn } from "@/lib/cn";

// Bảng biến thể button tập trung để đổi style một lần.
const variants = {
  // Button đỏ chính dùng cho CTA đặt món.
  primary: "bg-brand-red text-white hover:bg-brand-redDark shadow-glow",
  // Button sáng dùng trên nền tối.
  light: "bg-white text-brand-ink hover:bg-brand-cream",
  // Button viền dùng cho hành động phụ.
  outline: "border border-white/40 text-white hover:bg-white hover:text-brand-ink",
  // Button ghost dùng trong card sáng.
  ghost: "border border-brand-line bg-white text-brand-ink hover:border-brand-red hover:text-brand-red",
};
type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
};
// Component ButtonLink tái sử dụng cho CTA nội bộ.
export function ButtonLink({ href, children, variant = "primary", className }: ButtonLinkProps) {
  // Trả về Link có style button thống nhất.
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring inline-flex items-center justify-center px-6 py-3 text-sm font-bold transition duration-300",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
