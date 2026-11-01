import Image from "next/image";

import { site } from "@/core/config/site-data";
import { Container } from "@/shared/ui/Container";

/* ============================================================
 * DATA — mô tả theo Toplist, Mia.vn, MyTour (các bài review quán). Không ghi giá: giá lấy từ Thực đơn (Backend).
 * ========================================================== */

const dishHighlights = [
  "Bánh tráng mỏng từ bột gạo, cuộn nhân thịt heo, mộc nhĩ và hành.",
  "Mỗi đĩa bốn cuốn, rắc hành phi giòn, ăn cùng rau và giá.",
  "Chả lụa, chả quế dọn riêng một đĩa bên cạnh.",
  "Nước mắm chấm điểm thêm vài giọt tinh dầu cà cuống, đúng kiểu bánh cuốn Bắc.",
];

/* ============================================================
 * COMPONENT
 * ========================================================== */

export function AboutSignatureDish() {
  return (
    <section aria-labelledby="about-signature-dish" className="section-padding bg-white">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image
              src={site.assets.dishPhoto}
              alt="Đĩa bánh cuốn Tây Hồ 127 rắc hành phi, ăn kèm chả lụa"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-red">Món làm nên tên quán</p>
            <h2 id="about-signature-dish" className="heading-section mt-2 text-brand-green">
              Đĩa bánh cuốn Tây Hồ
            </h2>
            <ul className="mt-6 space-y-3">
              {dishHighlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-[15px] font-medium leading-7 text-brand-ink/85">
                  <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand-red" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
