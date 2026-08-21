import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { site } from "@/data/site";

/* ============================================================
 * MENU HERO
 * ========================================================== */

export function MenuHero() {
  return (
    <section
      className="
        overflow-hidden
        bg-brand-ink bg-hero
        text-white
      "
    >
      <Container
        className="
          grid
          items-center
          gap-10
          py-12

          sm:py-14

          md:gap-12
          md:py-16

          lg:grid-cols-[0.9fr_1.1fr]
          lg:gap-16
          lg:py-20
        "
      >
        {/* ====================================================
         * CONTENT
         * ================================================== */}

        <div
          className="
            mx-auto
            max-w-[620px]
            text-center

            lg:mx-0
            lg:text-left
          "
        >
          {/* Badge */}
          <span
            className="
              inline-flex
              items-center
              rounded-full
              border border-white/20
              bg-white/10
              px-3.5 py-2

              text-[10px]
              font-black
              uppercase
              tracking-[0.18em]
              text-white/80

              backdrop-blur-sm

              sm:px-4
              sm:text-[11px]
              sm:tracking-[0.22em]

              md:text-xs
            "
          >
            Thực đơn Tây Hồ 127
          </span>

          {/* Heading */}
          <h1
            className="
              heading-xl
              mt-5
              text-[34px]
              font-black
              leading-[1.1]

              sm:mt-6
              sm:text-[40px]

              md:text-[48px]

              lg:mt-7
              lg:text-[52px]
            "
          >
            Chọn món nhanh,
            <br className="hidden sm:block" />
            {" "}xem giá dễ dàng
          </h1>

          {/* Description */}
          <p
            className="
              mx-auto
              mt-5
              max-w-[560px]

              text-[15px]
              font-medium
              leading-7
              text-white/70

              sm:text-[16px]

              md:mt-6
              md:text-[17px]
              md:leading-8

              lg:mx-0
            "
          >
            Khám phá thực đơn Bánh Cuốn Tây Hồ 127 với những món ăn
            mang đậm hương vị truyền thống Việt Nam, được chuẩn bị
            chỉn chu và minh bạch về giá.
          </p>
        </div>

        {/* ====================================================
         * HERO IMAGE
         * ================================================== */}

        <div
          className="
            relative
            mx-auto
            w-full
            max-w-[460px]

            sm:max-w-[520px]

            lg:max-w-[600px]
          "
        >
          {/* Background Glow */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-[12%]
              rounded-full
              bg-brand-red/20
              blur-3xl
            "
          />

          <Image
            src={site.assets.heroPlatter}
            alt="Mâm bánh cuốn Tây Hồ 127"
            width={1024}
            height={572}
            priority
            sizes="
              (max-width: 640px) 90vw,
              (max-width: 1024px) 70vw,
              600px
            "
            className="
              relative
              h-auto
              w-full
              object-contain
              drop-shadow-[0_24px_60px_rgba(0,0,0,0.32)]

              md:drop-shadow-[0_30px_70px_rgba(0,0,0,0.35)]
            "
          />
        </div>
      </Container>
    </section>
  );
}