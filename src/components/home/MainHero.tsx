import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { ButtonLink } from "../ui/ButtonLink";
import Image from "next/image";

export function MainHero() {
  return (
    <section className="relative overflow-hidden bg-brand-cream pb-0">

      <div className="relative min-h-[410px] px-5 pt-10 md:px-[105px] md:pt-12">
        <Image src="/assets/leaf-basil.png" alt="" width={118} height={118} className="absolute -left-16 top-8 w-[118px] rotate-[18deg] opacity-90" />  
        <Image src="/assets/leaf-small.png" alt="" width={80} height={80} className="absolute bottom-11 left-0 w-[80px] opacity-90" />
        <Image src="/assets/leaf-cluster.png" alt="" width={220} height={220}  className="absolute right-0 top-0 w-[220px] opacity-95" />

        <div className="relative z-10 grid items-center gap-8 md:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="mb-0 text-[30px] font-black leading-none text-brand-green md:text-[42px]">Bánh cuốn</p>
            <h1 className="font-display text-[62px] font-black leading-[0.9] tracking-tight text-brand-red md:text-[92px]">
              TÂY HỒ
            </h1>
            <p className="mt-5 max-w-[330px] text-[15px] font-black leading-5 text-tayho-greenDark">
              Từ bàn tay khéo léo,<br />mỗi phần bánh là một câu chuyện Việt.*
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/checkout" className="btn-primary">Đặt ngay</ButtonLink>
              <ButtonLink href="/menu" className="btn-outline">Xem thực đơn</ButtonLink>
            </div>
          </div>

          <div className="relative min-h-[330px]">
            <div className="absolute left-0 top-24 h-[110px] w-[110px] rounded-full bg-[#9fd36a]" />
            <div className="absolute bottom-3 left-20 h-[198px] w-[230px] rounded-full bg-tayho-yellow" />
            <Image src="/assets/hero-plate.png" alt="Mâm bánh cuốn Tây Hồ" width={620} height={330} className="absolute -right-10 top-6 z-10 w-[620px] max-w-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
