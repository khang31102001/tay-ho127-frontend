import { Container } from "@/components/ui/Container";

/**
 * Cùng công thức với MenuHero (bg-brand-ink + bg-hero, badge pill, heading-xl)
 * để Tin tức không tạo Hero lệch brand — chỉ bỏ ảnh sản phẩm vì News không
 * có 1 ảnh đại diện cố định như Thực đơn.
 */
export function NewsHero() {
  return (
    <section className="overflow-hidden bg-brand-ink bg-hero text-white">
      <Container className="flex flex-col items-center gap-4 py-14 text-center sm:py-16 md:py-20">
        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm sm:px-4 sm:text-[11px] sm:tracking-[0.22em] md:text-xs">
          Tin tức Tây Hồ 127
        </span>

        <h1 className="heading-xl text-[34px] sm:text-[40px] md:text-[48px]">Tin tức</h1>

        <p className="max-w-[560px] text-[15px] font-medium leading-7 text-white/70 sm:text-[16px] md:text-[17px] md:leading-8">
          Công thức, câu chuyện thương hiệu, ưu đãi và hoạt động mới nhất từ Bánh Cuốn Tây Hồ 127.
        </p>
      </Container>
    </section>
  );
}
