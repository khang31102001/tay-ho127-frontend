import Image from "next/image";

import { Reveal } from "../common/Reveal";
import { Container } from "../ui/Container";

/* ============================================================
 * DATA
 * ========================================================== */

const storyParagraphs = [
  "Bánh Cuốn Tây Hồ bắt đầu từ một cửa hàng nhỏ tại phố cổ Hà Nội vào năm 1972. Với công thức gia truyền độc đáo và tình yêu dành cho ẩm thực truyền thống Việt Nam, chúng tôi đã dần xây dựng được thương hiệu uy tín và được yêu mến trong lòng người dân Hà Nội.",

  "Trải qua hơn 5 thập kỷ, Bánh Cuốn Tây Hồ vẫn giữ nguyên hương vị truyền thống với bột gạo tươi được làm thủ công mỗi ngày, nhân thịt thơm ngon, và nước chấm đặc trưng theo công thức bí truyền.",

  "Ngày nay, Bánh Cuốn Tây Hồ đã phát triển thành chuỗi nhà hàng trên khắp Việt Nam, nhưng chúng tôi vẫn luôn giữ vững triết lý kinh doanh: tôn trọng truyền thống, đảm bảo chất lượng, và không ngừng đổi mới để mang đến trải nghiệm tốt nhất cho khách hàng.",
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
                  Nửa thế kỷ
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
          </article>
        </div>
      </Container>
    </section>
  );
}