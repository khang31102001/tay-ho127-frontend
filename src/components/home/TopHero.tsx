"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPin, Phone, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

/* =================================================
 * TYPES
 * =============================================== */

type HeroAction = {
  label: string;
  href: string;
  variant: "primary" | "outline";
};

type HeroContentItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string[];
  actions: HeroAction[];
};

type ContactInformationItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

/* =================================================
 * DATA
 * =============================================== */

const heroContent: HeroContentItem[] = [
  {
    id: "tay-ho-main",
    eyebrow: "Bánh cuốn",
    title: "TÂY HỒ",
    description: [
      "Từ bàn tay khéo léo,",
      "mỗi phần bánh là một câu chuyện Việt.",
    ],
    actions: [
      {
        label: "Đặt ngay",
        href: "/menu",
        variant: "primary",
      },
      {
        label: "Xem thực đơn",
        href: "/menu",
        variant: "outline",
      },
    ],
  },
];

const contactInformation: ContactInformationItem[] = [
  {
    id: "address",
    title: "Địa chỉ chính",
    description: "127 Đinh Tiên Hoàng, TP.HCM",
    icon: MapPin,
  },
  {
    id: "opening-hours",
    title: "Mở cửa hằng ngày",
    description: "06:00 - 22:00",
    icon: Clock3,
  },
  {
    id: "contact",
    title: "Liên hệ đặt bàn",
    description: "090 123 4567",
    icon: Phone,
  },
];

/* =================================================
 * CONSTANTS
 * =============================================== */

const SCROLL_THRESHOLD = 50;

/* =================================================
 * TOP HERO
 * =============================================== */

export function TopHero() {
  const [isScrolled, setIsScrolled] = useState(false);

  /* =================================================
   * SCROLL STATE
   * =============================================== */

  useEffect(() => {
    const handleScroll = () => {
      const nextScrolledState =
        window.scrollY > SCROLL_THRESHOLD;

      setIsScrolled(nextScrolledState);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      className={`
        relative
        w-full
        snap-start
        overflow-hidden

        transition-[min-height,background-color]
        duration-500
        ease-out

        ${
          isScrolled
            ? `
              min-h-[460px]
              bg-brand-cream

              sm:min-h-[480px]
              md:min-h-[500px]
              lg:min-h-[540px]
            `
            : `
              min-h-svh
              bg-black
            `
        }
      `}
    >
      {/* =================================================
       * HERO 01
       * TRẠNG THÁI BAN ĐẦU
       * =============================================== */}

      <div
        className={`
          absolute
          inset-0

          transition-opacity
          duration-500
          ease-out

          ${
            isScrolled
              ? "pointer-events-none opacity-0"
              : "opacity-100"
          }
        `}
      >
        <Image
          src="/images/hero-cooking.png"
          alt="Tráng bánh cuốn thủ công"
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            object-center
          "
        />

        {/* Overlay tối */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-black/35
            via-black/10
            to-black/30
          "
        />

        {/* Michelin */}
        <div
          className="
            absolute
            bottom-6
            right-5
            z-20

            flex
            h-[66px]
            w-[66px]
            items-center
            justify-center

            rounded-full
            bg-brand-red

            text-center
            text-[10px]
            font-black
            leading-tight
            text-white

            shadow-card

            sm:h-[76px]
            sm:w-[76px]
            sm:text-[11px]

            lg:bottom-7
            lg:right-8
            lg:h-[93px]
            lg:w-[93px]
            lg:text-[13px]
          "
        >
          MICHELIN
          <br />
          2026
        </div>
      </div>

      {/* =================================================
       * HERO 02
       * XUẤT HIỆN SAU KHI SCROLL > 50
       * =============================================== */}

      <div
        className={`
          absolute
          inset-0

          transition-opacity
          duration-500
          ease-out

          ${
            isScrolled
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      >
        {/* =================================================
         * BACKGROUND BANNER
         * =============================================== */}

        <Image
          src="/images/banner-home-1.png"
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden="true"
          className="
            object-cover
            object-[68%_center]

            sm:object-[65%_center]
            md:object-[63%_center]
            lg:object-center
          "
        />

        {/* =================================================
         * GRADIENT HỖ TRỢ TEXT
         * Mobile cần mạnh hơn để text không chìm
         * =============================================== */}

        <div
          aria-hidden="true"
          className="
            absolute
            inset-0

            bg-gradient-to-r
            from-brand-cream
            via-brand-cream/90
            to-brand-cream/5

            md:via-brand-cream/70

            lg:via-brand-cream/20
            lg:to-transparent
          "
        />

        {/* =================================================
         * MAIN CONTENT
         * =============================================== */}

        <div
          className="
            relative
            z-10

            mx-auto
            flex
            h-full
            w-full
            max-w-[1200px]
            items-start

            px-5
            pb-[86px]
            pt-[88px]

            sm:px-7
            sm:pt-[96px]

            md:px-8
            md:pb-[90px]
            md:pt-[110px]

            lg:px-0
            lg:pt-[120px]
          "
        >
          {/* =================================================
           * TEXT CONTENT
           * =============================================== */}

          {heroContent.map((content) => (
            <div
              key={content.id}
              className="
                w-[72%]
                max-w-[400px]

                sm:w-[58%]
                sm:max-w-[440px]

                md:w-[46%]
                md:max-w-[470px]

                lg:w-[40%]
                lg:max-w-[500px]
              "
            >
              {/* Eyebrow */}
              <p
                className="
                  mb-0
                  text-[20px]
                  font-black
                  leading-none
                  text-brand-green

                  sm:text-[24px]
                  md:text-[28px]
                  lg:text-[32px]
                "
              >
                {content.eyebrow}
              </p>

              {/* Title */}
              <h1
                className="
                  font-display
                  text-[44px]
                  leading-[0.95]
                  text-brand-red

                  sm:text-[52px]
                  md:text-[64px]
                  lg:text-[76px]
                "
              >
                {content.title}
              </h1>

              {/* Description */}
              <p
                className="
                  mt-3
                  max-w-[300px]

                  text-[10px]
                  font-medium
                  leading-[1.4]
                  text-brand-greenDark

                  sm:text-[11px]

                  md:max-w-[340px]
                  md:text-[12px]

                  lg:text-[13px]
                "
              >
                {content.description.map((line, index) => (
                  <span key={`${content.id}-description-${index}`}>
                    {line}

                    {index < content.description.length - 1 && (
                      <br />
                    )}
                  </span>
                ))}
              </p>

              {/* =================================================
               * CTA
               * =============================================== */}

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  items-center
                  gap-2

                  sm:mt-6
                  sm:gap-3

                  lg:mt-8
                "
              >
                {content.actions.map((action) => {
                  const isPrimary =
                    action.variant === "primary";

                  return (
                    <Link
                      key={`${content.id}-${action.label}`}
                      href={action.href}
                      className={`
                        inline-flex
                        min-h-[38px]
                        items-center
                        justify-center

                        rounded-md
                        px-5

                        text-[12px]
                        font-black

                        transition
                        duration-200

                        active:scale-[0.98]

                        sm:min-h-[40px]
                        sm:px-6
                        sm:text-[13px]

                        lg:min-h-[44px]
                        lg:px-7
                        lg:text-[14px]

                        ${
                          isPrimary
                            ? `
                              bg-brand-red
                              text-white
                              hover:opacity-90
                            `
                            : `
                              border-2
                              border-brand-green
                              bg-white/90
                              text-brand-green

                              hover:bg-brand-green
                              hover:text-white
                            `
                        }
                      `}
                    >
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* =================================================
         * CONTACT INFORMATION BAR
         * =============================================== */}

        <div
          className="
            absolute
            bottom-0
            left-0
            z-20
            w-full

            bg-brand-red
            text-white
          "
        >
          <div
            className="
              mx-auto
              grid
              min-h-[66px]
              w-full
              max-w-[1200px]
              grid-cols-3
              items-center
              px-3

              sm:min-h-[70px]
              sm:px-5

              md:px-8

              lg:min-h-[76px]
              lg:px-0
            "
          >
            {contactInformation.map((item, index) => {
              const Icon = item.icon;
              const isLastItem =
                index === contactInformation.length - 1;

              return (
                <div
                  key={item.id}
                  className={`
                    flex
                    min-w-0
                    items-center
                    justify-center
                    gap-1.5
                    px-1

                    sm:gap-2
                    sm:px-3

                    ${
                      !isLastItem
                        ? "border-r border-white/20"
                        : ""
                    }
                  `}
                >
                  <Icon
                    className="
                      size-[16px]
                      shrink-0

                      sm:size-[20px]
                      lg:size-[24px]
                    "
                  />

                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-[8px]
                        font-black

                        sm:text-[10px]
                        lg:text-[12px]
                      "
                    >
                      {item.title}
                    </p>

                    <p
                      className="
                        hidden
                        text-[8px]
                        leading-tight
                        text-white/80

                        sm:block
                        lg:text-[9px]
                      "
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}