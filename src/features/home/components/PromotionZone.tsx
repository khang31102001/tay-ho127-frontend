import Image from "next/image";
import { Reveal } from "@/components/shared/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
export function PromotionZone() {
  return (
     <section className="relative min-h-svh overflow-hidden">
      <Reveal
        type="zoom-in"
        className="absolute inset-0"
        duration={1}
      >
        <Image
          src="/images/promotion-zone-1.png"
          alt="Ưu đãi bánh cuốn Tây Hồ"
          width={1200}
          height={800}
          className="size-full object-cover"
        />
      </Reveal>

      <div className="relative z-10 flex min-h-svh items-center justify-center">
        <div className="text-center">
          <Reveal type="fade-up" delay={0.15}>
            <h2 className="text-brand-green text-5xl font-bold">
              Hương vị truyền thống
            </h2>
          </Reveal>

          <Reveal type="fade-up" delay={0.3}>
            <ButtonLink href="/menu" className="mt-8">
              Xem ưu đãi
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
// export function PromotionZone() {
//   return (
//     <section className="promotion-zone">
//       <div className="promotion-zone__inner">
//         <h2 className="promotion-zone__title">Promotion zone</h2>

//         <div className="promotion-zone__grid">
//           {promotionImages.map((image) => (
//             <div key={image.id} className="promotion-zone__card">
//               <Image
//                 src={image.src}
//                 alt={image.alt}
//                 width={620}
//                 height={360}
//                 className="promotion-zone__image"
//               />
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }