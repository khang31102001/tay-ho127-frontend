"use client";

// Import Container để giữ padding/max-width đồng bộ.
import { Container } from "@/components/ui/Container";
// Import Logo dùng lại ở footer.
import { Logo } from "@/components/ui/Logo";
// Import dữ liệu site tập trung.
import { site } from "@/data/site";
// Import Link cho các đường dẫn footer.
import Link from "next/link";

import {
  Clock3,
  Globe,
  MapPin,
  Phone,
  Share2,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";
// Import thẳng component + type (không qua barrel @/features/navigation) —
// barrel đó re-export cả Explorer/Editor/Tree admin (UI "use client"), import
// qua barrel ở Footer (Site) sẽ kéo UI admin vào bundle Site. Lý do đầy đủ
// xem app/(site)/layout.tsx.
import { NavigationRenderer } from "@/features/navigation/components/NavigationRenderer";
import { useLiveNavigation } from "@/features/navigation/hooks/useLiveNavigation";
import type { NavigationItem } from "@/features/navigation/types/navigation.types";

/* =================================================
 * TYPES
 * =============================================== */

type SocialItem = {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
};

type FooterProps = {
  /**
   * Lấy động từ Navigation module (features/navigation) — do
   * app/(site)/layout.tsx (Server Component) fetch qua
   * navigationApi.getByLocation("footer") rồi truyền xuống làm giá trị khởi
   * tạo (SSR); Footer tự refetch lại 1 lần khi mount (useLiveNavigation) để
   * đồng bộ thay đổi Admin vừa lưu trong cùng session. Không truyền = cột
   * "Điều hướng" tự ẩn — Footer vẫn hoạt động bình thường như trước khi có
   * Navigation.
   */
  navItems?: NavigationItem[];
};

/* =================================================
 * DATA
 * =============================================== */

const socialItems: SocialItem[] = [
  {
    id: "website",
    label: site.following?.web ?? "",
    href: site.following?.web,
    icon: Globe,
  },
  {
    id: "shopee",
    label: site.following?.shopee ?? "",
    href: site.following?.shopee,
    icon: ShoppingBag,
  },
  {
    id: "facebook",
    label: site.following?.facebook ?? "",
    href: site.following?.facebook,
    icon: Share2,
  },
];

/* =================================================
 * FOOTER
 * =============================================== */

// Footer chứa thông tin liên hệ và menu phụ.
export function Footer({ navItems: initialNavItems = [] }: FooterProps) {
  const navItems = useLiveNavigation("footer", initialNavItems);

  return (
    <footer
      id="lien-he"
      className="
        relative
        overflow-hidden
        bg-brand-green
        text-white
      "
    >
      {/* =================================================
       * DECORATIVE BACKGROUND EFFECT
       * Chỉ tạo điểm nhấn khi người dùng kéo xuống Footer.
       * =============================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-orange-400/10
          blur-3xl
          animate-pulse
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-32
          -right-24
          h-96
          w-96
          rounded-full
          bg-white/5
          blur-3xl
          animate-pulse
          [animation-delay:700ms]
        "
      />

      {/* =================================================
       * TOP ACCENT
       * =============================================== */}

      <Reveal
        type="fade-up"
        delay={0}
        duration={0.45}
      >
        <div
          className="
            h-[3px]
            w-full
            bg-gradient-to-r
            from-transparent
            via-orange-400
            to-transparent
          "
        />
      </Reveal>

      {/* =================================================
       * FOOTER CONTENT
       * =============================================== */}

      <Container
        className={`
          relative
          z-10
          grid
          gap-10
          py-12

          ${navItems.length > 0 ? "md:grid-cols-[1.1fr_.7fr_.7fr_.8fr]" : "md:grid-cols-[1.2fr_.8fr_.8fr]"}
          md:py-16
        `}
      >
        {/* =================================================
         * BRAND / LOGO
         * =============================================== */}

        <Reveal
          type="fade-up"
          delay={0.05}
          duration={0.6}
        >
          <div
            className="
              group
              relative
            "
          >
            <Logo
              tone="white"
              className="
                h-auto
                w-full
                transition-transform
                duration-500
                ease-out

                group-hover:-translate-y-1
                group-hover:scale-[1.02]
              "
            />
          </div>
        </Reveal>

        {/* =================================================
         * ĐIỀU HƯỚNG — lấy động từ Navigation module (location "footer"),
         * không hard-code danh sách link. Ẩn cả cột nếu chưa có menu nào
         * kích hoạt ở vị trí này (navItems rỗng).
         * =============================================== */}

        {navItems.length > 0 && (
          <Reveal type="fade-up" delay={0.08} duration={0.5}>
            <h3
              className="
                text-sm
                font-black
                uppercase
                tracking-[0.22em]
                text-white
              "
            >
              Điều hướng
            </h3>

            <NavigationRenderer
              items={navItems}
              variant="footer"
              className="mt-5 space-y-2.5 text-sm leading-6"
              itemClassName="text-white/70 transition-colors duration-300 hover:text-white"
              nestedListClassName="ml-3 mt-2 space-y-2 border-l border-white/15 pl-3"
            />
          </Reveal>
        )}

        {/* =================================================
         * SOCIAL
         * =============================================== */}

        <div>
          <Reveal
            type="slide-left"
            delay={0.1}
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
              Theo dõi chúng tôi
            </h3>
          </Reveal>

          <div className="mt-5 space-y-3 text-sm leading-6">
            {socialItems.map((item, index) => {
              const Icon = item.icon;

              if (!item.href || !item.label) {
                return null;
              }

              return (
                <Reveal
                  key={item.id}
                  type="fade-up"
                  delay={0.14 + index * 0.08}
                  duration={0.45}
                >
                  <div
                    className="
                      group
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-orange-500
                        p-2

                        transition-all
                        duration-300

                        group-hover:-translate-y-0.5
                        group-hover:rotate-6
                        group-hover:scale-110
                        group-hover:bg-orange-600
                      "
                    >
                      <Icon className="size-4 text-white" />
                    </div>

                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        break-all
                        text-white/70

                        transition-all
                        duration-300

                        group-hover:translate-x-1
                        group-hover:text-white
                      "
                    >
                      {item.label}
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* =================================================
         * CONTACT
         * =============================================== */}

        <div>
          <Reveal
            type="slide-left"
            delay={0.16}
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

          <div className="mt-5 space-y-3 text-sm leading-6">
            {/* Địa chỉ */}
            <Reveal
              type="slide-left"
              delay={0.22}
              duration={0.45}
            >
              <div
                className="
                  group
                  flex
                  items-start
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
                  href={site.following?.web ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-white/70

                    transition-all
                    duration-300

                    hover:text-white
                  "
                >
                  {site.address}
                </Link>
              </div>
            </Reveal>

            {/* Số điện thoại */}
            <Reveal
              type="slide-left"
              delay={0.3}
              duration={0.45}
            >
              <div
                className="
                  group
                  flex
                  items-start
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
                  href={`tel:${site.phone}`}
                  className="
                    text-white/70

                    transition-all
                    duration-300

                    hover:text-white
                  "
                >
                  {site.phone}
                </Link>
              </div>
            </Reveal>

            {/* Giờ mở cửa */}
            <Reveal
              type="slide-left"
              delay={0.38}
              duration={0.45}
            >
              <div
                className="
                  group
                  flex
                  items-start
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
                  {site.openingHours}
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </footer>
  );
}