import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/shared/components/Reveal";
import { Container } from "@/shared/ui/Container";

/* ============================================================
 * DATA
 * ========================================================== */

const storyParagraphs = [
  "Bánh Cuốn Tây Hồ bắt đầu từ năm 1961, khi một tiệm bánh cuốn nhỏ mở bán cạnh đền thờ cụ Phan Châu Trinh ở Sài Gòn. Thực khách quen gọi quán theo hiệu \"Tây Hồ\" của cụ, và cái tên ấy theo quán về tới số 127 Đinh Tiên Hoàng hôm nay.",

  "Hơn 60 năm qua, quán vẫn giữ cách làm truyền thống: bánh tráng mỏng từ bột gạo mỗi ngày, nhân thịt thơm ngon và nước chấm theo công thức gia truyền.",

  "Năm 2026, Bánh Cuốn Tây Hồ 127 được Cẩm nang MICHELIN đưa vào danh sách Bib Gourmand, dành cho những quán ngon với giá hợp lý. Với chúng tôi, đó là lời nhắc tiếp tục giữ trọn hương vị đã làm nên tên quán.",
];

const storyImages = {
  top: "/images/banh-cuon-dish.jpg",
  bottom: "/images/banh-cuon-dish.jpg",
  side: "/images/story-col-1.png",
};

/* ============================================================
 * COMPONENT
 * ========================================================== */

export function StorySection() {
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
                    src={storyImages.top}
                    alt="Bánh cuốn Tây Hồ"
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
                    src={storyImages.bottom}
                    alt="Món ăn truyền thống của Tây Hồ"
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
                  src={storyImages.side}
                  alt="Câu chuyện Bánh Cuốn Tây Hồ"
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
                <span className="text-brand-red">
                  Hơn 6 thập kỷ
                </span>{" "}
                <span className="text-brand-green">
                  gìn giữ vị xưa
                </span>
              </h2>
            </Reveal>

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
              {storyParagraphs.map((paragraph, index) => (
                <Reveal
                  key={paragraph}
                  type="fade-up"
                  delay={0.1 + index * 0.06}
                  duration={0.55}
                  once={false}
                >
                  <p className="text-justify">{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <Reveal type="fade-up" delay={0.3} duration={0.55} once={false}>
              <Link
                href="/gioi-thieu"
                className="focus-ring mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-red underline-offset-4 hover:underline sm:text-[15px]"
              >
                Đọc câu chuyện Tây Hồ 127
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Reveal>
          </article>
        </div>
      </Container>
    </section>
  );
}