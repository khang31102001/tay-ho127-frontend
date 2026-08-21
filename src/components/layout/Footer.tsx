// Import Container để giữ padding/max-width đồng bộ.
import { Container } from "@/components/ui/Container";
// Import Logo dùng lại ở footer.
import { Logo } from "@/components/ui/Logo";
// Import dữ liệu site và nav tập trung.
import { navItems, brand } from "@/data/site";
// Import Link cho các đường dẫn footer.
import Link from "next/link";

import {
  MapPin,
  Clock3,
  Phone,
  Globe,
  ShoppingBag,
  Share2,

} from "lucide-react";
import { Reveal } from "../common/animation";

// Footer chứa thông tin liên hệ và menu phụ.
export function Footer() {
  // Render footer nền tối tương phản với nền kem.
  return (
    <footer id="lien-he" className="bg-brand-green text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.2fr_.8fr_.8fr] md:py-16">
        <div>
          <Logo tone="white" className="h-auto w-full" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-white">Theo dõi chúng tôi</h3>
          <div className="mt-5 space-y-3 text-sm leading-6 text-white/70">
            <div className="flex items-start gap-3">
              <div className="flex p-2 items-center justify-center rounded-full bg-orange-500 transition hover:scale-105 hover:bg-orange-600">
                <Globe className="size-4 text-white" />
              </div>

              <Link href={brand.following?.web} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                {brand.following?.web}
              </Link>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex p-2 items-center justify-center rounded-full bg-orange-500 transition hover:scale-105 hover:bg-orange-600">
                <ShoppingBag className="size-4 text-white" />
              </div>

              <Link href={brand.following?.shopee} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                {brand.following?.shopee}
              </Link>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex p-2 items-center justify-center rounded-full bg-orange-500 transition hover:scale-105 hover:bg-orange-600">
                <Share2 className="size-4 text-white" />
              </div>
              <Link
                href={brand.following?.facebook ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-white/70 hover:text-white">
                <p>{brand.following?.facebook}</p>
              </Link>
            </div>
          </div>
        </div>
        <div>
          {/* =========================================================
        * TITLE
        * ======================================================= */}
          <Reveal
            type="slide-left"
            delay={0.05}
            duration={0.45}
          >
            <h3
              className="
        text-sm
        font-black
        uppercase
        tracking-[0.22em]
        text-white
      "
            >
              Thông tin liên hệ
            </h3>
          </Reveal>

          {/* =========================================================
   * CONTACT INFORMATION
   * ======================================================= */}
          <div className="mt-5 space-y-3 text-sm leading-6">
            {/* Địa chỉ */}
            <Reveal
              type="slide-left"
              delay={0.08}
              duration={0.45}
            >
              <div
                className="
          group
          flex items-start
          gap-3
        "
              >
                <MapPin
                  className="
            mt-1
            size-4
            shrink-0
            text-white
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
                />

                <Link
                  href={brand.following?.web ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
            text-white/70
            transition-all
            duration-300
            hover:text-white
          "
                >
                  {brand.address}
                </Link>
              </div>
            </Reveal>

            {/* Số điện thoại */}
            <Reveal
              type="slide-left"
              delay={0.13}
              duration={0.45}
            >
              <div
                className="
          group
          flex items-start
          gap-3
        "
              >
                <Phone
                  className="
            mt-1
            size-4
            shrink-0
            text-white
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
                />

                <Link
                  href={`tel:${brand.phone}`}
                  className="
            text-white/70
            transition-all
            duration-300
            hover:text-white
          "
                >
                  {brand.phone}
                </Link>
              </div>
            </Reveal>

            {/* Giờ mở cửa */}
            <Reveal
              type="slide-left"
              delay={0.18}
              duration={0.45}
            >
              <div
                className="
          group
          flex items-start
          gap-3
        "
              >
                <Clock3
                  className="
            mt-1
            size-4
            shrink-0
            text-white
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
                />

                <span
                  className="
            text-white/70
            transition-colors
            duration-300
            group-hover:text-white
          "
                >
                  {brand.openingHours}
                </span>
              </div>
            </Reveal>
          </div>
        </div>
        {/* <div>
          <h3 className="text-sm font-black uppercase tracking-[0.22em] text-white">Điều hướng</h3>
          <div className="mt-5 grid gap-3 text-sm text-white/70">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div> */}
      </Container>
      {/* <div className="border-t border-white/10 py-5 text-center text-xs uppercase tracking-[0.18em] text-white/50">
        © 2026 {site.name}. Frontend source by Next.js + TailwindCSS.
      </div> */}
    </footer>
  );
}
