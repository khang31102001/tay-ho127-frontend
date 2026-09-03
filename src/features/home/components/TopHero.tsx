"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPin, Phone, type LucideIcon } from "lucide-react";

import { useScrollThreshold } from "@/hooks/useScrollThreshold";

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

type HeroOrderField = {
  id: string;
  label: string;
  type: "text" | "tel";
  autoComplete: string;
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
    description: "127 Đinh Tiên Hoàng, Phường Đa Kao, TP.HCM",
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

const heroOrderFields: HeroOrderField[] = [
  {
    id: "hero-order-name",
    label: "Tên",
    type: "text",
    autoComplete: "name",
  },
  {
    id: "hero-order-phone",
    label: "SĐT",
    type: "tel",
    autoComplete: "tel",
  },
  {
    id: "hero-order-address",
    label: "Địa chỉ",
    type: "text",
    autoComplete: "street-address",
  },
];

/* =================================================
 * TOP HERO
 * =============================================== */

export function TopHero() {
  const isScrolled = useScrollThreshold();

  return (
    <section
      className={`
        relative
        w-full
        min-h-svh
        overflow-hidden

        transition-colors
        duration-500
        ease-out

        ${isScrolled ? "bg-brand-cream" : "bg-black"}
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
        <video
          src="/videos/tayho12.mp4"
          poster="/images/hero-cooking.png"
          autoPlay
          loop
          muted
          playsInline
          className="
            absolute
            inset-0
            h-full
            w-full
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
            h-[120px]
            w-[120px]
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
          <Image src="/images/michelin-2026-2.png" alt="Michelin"  fill className="object-contain" />
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
          src="/images/banner-home2.png"
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
            flex-col
            items-start
            justify-center
            gap-4
            
            px-5
            pb-[86px]
            pt-[160px]
            pl-[64px]
            md:pl-[80px]
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
                  mb-4
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
      w-full
      max-w-[1200px]

      grid-cols-1
      gap-y-4

      px-5
      py-4

      sm:grid-cols-3
      sm:gap-y-0
      sm:px-6
      sm:py-4

      md:px-8
      md:py-5

      lg:min-h-[88px]
      lg:px-0
      lg:py-0
    "
  >
    {contactInformation.map((item) => {
      const Icon = item.icon;

      return (
        <div
          key={item.id}
          className="
            flex
            min-w-0
            items-center
            justify-start
            gap-3

            sm:justify-center
            sm:gap-3

            md:gap-4

            lg:gap-5
          "
        >
          {/* =================================================
           * ICON
           * =============================================== */}

          <Icon
            className="
              size-[28px]
              shrink-0
              text-white

              sm:size-[30px]

              md:size-[36px]

              lg:size-[46px]
            "
            strokeWidth={2.4}
          />

          {/* =================================================
           * CONTENT
           * =============================================== */}

          <div
            className="
              flex
              min-w-0
              flex-col
              justify-center
              gap-1
            "
          >
            {/* Title */}

            <p
              className="
                truncate

                text-[13px]
                font-black
                leading-none
                text-white

                sm:text-[12px]

                md:text-[14px]

                lg:text-[16px]
              "
            >
              {item.title}
            </p>

            {/* Description */}

            <p
              className="
                text-[10px]
                font-medium
                leading-[1.25]
                text-white/90

                sm:text-[9px]

                md:text-[10px]

                lg:text-[11px]
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