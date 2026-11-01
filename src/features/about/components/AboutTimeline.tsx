import { Container } from "@/shared/ui/Container";

/* ============================================================
 * DATA
 * Câu chuyện thương hiệu chưa có Backend (xem dynamic-content-completion-plan.md) — giữ ở đây như StorySection.
 * Mọi mốc đã đối chiếu nguồn: Báo Đà Nẵng (06/2026), Cẩm nang MICHELIN Việt Nam 2026. Không thêm chi tiết chưa có nguồn.
 * ========================================================== */

type TimelineMilestone = {
  label: string;
  title: string;
  description: string;
};

const milestones: TimelineMilestone[] = [
  {
    label: "1961",
    title: "Tiệm bánh cuốn cạnh đền thờ cụ Phan Châu Trinh",
    description:
      "Bà Trần Thị Cà, người gốc Hà Nam, mở một tiệm bánh cuốn nhỏ chưa có tên bên cạnh đền thờ cụ Phan Châu Trinh, trên đường Gallimard xưa (nay là 23 Nguyễn Huy Tự, TP. Hồ Chí Minh).",
  },
  {
    label: "Tên gọi",
    title: "Thực khách gọi là \"bánh cuốn Tây Hồ\"",
    description:
      "Tây Hồ là hiệu của cụ Phan Châu Trinh. Khách quen gọi tiệm theo tên đền thờ ngay bên cạnh, và cái tên ấy gắn với quán từ đó.",
  },
  {
    label: "127 Đinh Tiên Hoàng",
    title: "Bánh Cuốn Tây Hồ 127",
    description:
      "Quán chuyển về số 127 Đinh Tiên Hoàng, cách chỗ cũ không xa, và chính thức mang tên Bánh Cuốn Tây Hồ 127. Từ một tiệm nhỏ, nay là căn tiệm hai tầng quen thuộc của người Sài Gòn.",
  },
  {
    label: "Hôm nay",
    title: "Ba thế hệ cùng giữ nghề",
    description:
      "Chị Trần Thị Thúy Loan, con dâu bà Cà, đã gắn bó với quán khoảng 30 năm. Thế hệ thứ ba trong gia đình nay cùng tham gia quản lý, tiếp tục gìn giữ hương vị và hình ảnh của quán.",
  },
  {
    label: "06/2026",
    title: "MICHELIN Bib Gourmand",
    description:
      "Cẩm nang MICHELIN Việt Nam 2026 đưa Bánh Cuốn Tây Hồ 127 vào danh sách Bib Gourmand, danh hiệu dành cho những quán ăn ngon với giá hợp lý.",
  },
];

/* ============================================================
 * COMPONENT
 * ========================================================== */

export function AboutTimeline() {
  return (
    <section aria-labelledby="about-timeline" className="section-padding bg-brand-cream">
      <Container>
        <div className="mx-auto max-w-[760px]">
          <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-brand-red">Từ 1961 đến nay</p>
          <h2 id="about-timeline" className="heading-section mt-2 text-center text-brand-green">
            Hơn 60 năm một tiệm bánh cuốn
          </h2>

          <ol className="mt-10 space-y-8 border-l-2 border-brand-red/30 pl-6 sm:pl-8">
            {milestones.map((milestone) => (
              <li key={milestone.label} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-4 border-brand-cream bg-brand-red sm:-left-[41px]"
                />
                <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">{milestone.label}</p>
                <h3 className="mt-1 text-[19px] font-black leading-snug text-brand-ink sm:text-[21px]">
                  {milestone.title}
                </h3>
                <p className="mt-2 text-[15px] font-medium leading-7 text-brand-ink/80">{milestone.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
