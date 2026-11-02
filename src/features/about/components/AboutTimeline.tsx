import type { SlotContent } from "@/features/content/public";
import { Container } from "@/shared/ui/Container";

/* ============================================================
 * COMPONENT
 * ========================================================== */

type AboutTimelineProps = {
  /** Ô "timeline" của trang Giới thiệu (Admin): eyebrow, heading, mỗi dòng danh sách = 1 mốc (nhãn, tiêu đề, nội dung). */
  content: SlotContent;
};

export function AboutTimeline({ content }: AboutTimelineProps) {
  const milestones = content.items.filter((item) => item.title && item.text);
  if (milestones.length === 0) return null;

  return (
    <section aria-labelledby="about-timeline" className="section-padding bg-brand-cream">
      <Container>
        <div className="mx-auto max-w-[760px]">
          {content.eyebrow && (
            <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-brand-red">{content.eyebrow}</p>
          )}
          {content.heading && (
            <h2 id="about-timeline" className="heading-section mt-2 text-center text-brand-green">
              {content.heading}
            </h2>
          )}

          <ol className="mt-10 space-y-8 border-l-2 border-brand-red/30 pl-6 sm:pl-8">
            {milestones.map((milestone) => (
              <li key={`${milestone.label}-${milestone.title}`} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-4 border-brand-cream bg-brand-red sm:-left-[41px]"
                />
                {milestone.label && (
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-red">{milestone.label}</p>
                )}
                <h3 className="mt-1 text-[19px] font-black leading-snug text-brand-ink sm:text-[21px]">
                  {milestone.title}
                </h3>
                <p className="mt-2 text-[15px] font-medium leading-7 text-brand-ink/80">{milestone.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
