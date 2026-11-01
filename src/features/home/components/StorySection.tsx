import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/shared/components/Reveal";
import { Container } from "@/shared/ui/Container";

import type { HomeStory } from "../services/story.service";

/* ============================================================
 * COMPONENT
 * ========================================================== */

type StorySectionProps = {
  /** Nội dung do Admin quản lý (section "Câu chuyện thương hiệu" của trang chủ) — xem getHomeStory(). */
  story: HomeStory;
};

export function StorySection({ story }: StorySectionProps) {
  return (
    <section
      className="
        flex
        min-h-svh
        flex-col
        justify-center
        bg-brand-cream
        pb-10
        pt-24
        sm:pb-12
        md:pb-14
        md:pt-28
        lg:pb-16
      "
    >
      <Container>
        <div
          className="
            grid
            items-center
            gap-6
            md:grid-cols-[0.95fr_1.05fr]
            md:gap-12
            lg:gap-16
          "
        >
          {/* ==================================================
           * IMAGE COLLAGE
           * ================================================ */}
          <div
            className="
              mx-auto
              grid
              w-full
              max-w-[420px]
              grid-cols-[1fr_0.72fr]
              gap-2
              sm:max-w-[520px]
              sm:gap-4
              md:max-w-none
              md:gap-5
            "
          >
            {/* LEFT COLUMN */}
            <Reveal
              type="slide-left"
              delay={0.05}
              duration={0.6}
              once={false}
            >
              <div className="grid gap-2 sm:gap-4 md:gap-5">
                <div
                  className="
                    relative
                    aspect-[16/11]
                    overflow-hidden
                    rounded-[18px]
                    sm:aspect-[16/10]
                    sm:rounded-[20px]
                  "
                >
                  <Image
                    src={story.images.top.src}
                    alt={story.images.top.alt}
                    fill
                    sizes="
                      (max-width: 768px) 60vw,
                      320px
                    "
                    className="
                      object-cover
                      transition-transform
                      duration-700
                      hover:scale-[1.03]
                    "
                  />
                </div>

                <div
                  className="
                    relative
                    hidden
                    aspect-[16/9]
                    overflow-hidden
                    rounded-[18px]
                    sm:block
                    sm:rounded-[20px]
                  "
                >
                  <Image
                    src={story.images.bottom.src}
                    alt={story.images.bottom.alt}
                    fill
                    sizes="
                      (max-width: 768px) 60vw,
                      320px
                    "
                    className="
                      object-cover
                      transition-transform
                      duration-700
                      hover:scale-[1.03]
                    "
                  />
                </div>
              </div>
            </Reveal>

            {/* RIGHT COLUMN */}
            <Reveal
              type="slide-left"
              delay={0.12}
              duration={0.6}
              once={false}
            >
              <div
                className="
                  relative
                  aspect-[3/4]
                  overflow-hidden
                  rounded-[18px]
                  sm:mt-7
                  sm:rounded-[20px]
                  md:mt-8
                "
              >
                <Image
                  src={story.images.side.src}
                  alt={story.images.side.alt}
                  fill
                  sizes="
                    (max-width: 768px) 35vw,
                    220px
                  "
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    hover:scale-[1.03]
                  "
                />
              </div>
            </Reveal>
          </div>

          {/* ==================================================
           * STORY CONTENT
           * ================================================ */}
          <article
            className="
              mx-auto
              w-full
              max-w-[620px]
              md:max-w-none
            "
          >
            {/* TITLE */}
            {(story.heading || story.subheading) && (
              <Reveal
                type="fade-up"
                delay={0.05}
                duration={0.55}
                once={false}
              >
                <h2
                  className="
                    heading-section
                    text-center
                  "
                >
                  {story.heading && (
                    <span className="text-brand-red">
                      {story.heading}
                    </span>
                  )}
                  {story.heading && story.subheading && " "}
                  {story.subheading && (
                    <span className="text-brand-green">
                      {story.subheading}
                    </span>
                  )}
                </h2>
              </Reveal>
            )}

            {/* CONTENT */}
            <div
              className="
                mt-4
                space-y-3
                text-justify
                text-[13px]
                font-medium
                leading-[1.5]
                text-[#26351e]
                sm:mt-6
                sm:text-[16px]
                sm:leading-7
                sm:space-y-4
                md:mt-7
                md:space-y-5
              "
            >
              {story.paragraphs.map((paragraph, index) => (
                <Reveal
                  key={`${index}-${paragraph}`}
                  type="fade-up"
                  delay={0.1 + index * 0.06}
                  duration={0.55}
                  once={false}
                >
                  <p className="text-justify">{paragraph}</p>
                </Reveal>
              ))}
            </div>

            {story.cta && (
              <Reveal type="fade-up" delay={0.3} duration={0.55} once={false}>
                <Link
                  href={story.cta.href}
                  className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-red underline-offset-4 hover:underline sm:text-[15px]"
                >
                  {story.cta.label}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Reveal>
            )}
          </article>
        </div>
      </Container>
    </section>
  );
}