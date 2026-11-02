import { ChevronDown } from "lucide-react";

import { Container } from "@/shared/ui/Container";

import type { ContactFaqItem } from "../utils/contact-faq";

type ContactFaqProps = {
  items: ContactFaqItem[];
  /** Nhãn nhỏ + tiêu đề (ô "faq" của trang Liên hệ) — rỗng thì không hiện. */
  eyebrow: string;
  heading: string;
};

/**
 * Câu hỏi thường gặp dạng <details> (không cần JS). Câu trả lời dựng từ dữ liệu Admin (buildContactFaq) nên luôn
 * khớp thông tin đang hiển thị trên trang. Nội dung để khách đọc — không gắn FAQPage schema vì Google không còn hiển
 * thị FAQ rich result cho trang nhà hàng.
 */
export function ContactFaq({ items, eyebrow, heading }: ContactFaqProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="contact-faq" className="section-padding bg-white">
      <Container>
        <div className="mx-auto max-w-[760px]">
          {eyebrow && (
            <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-brand-red">{eyebrow}</p>
          )}
          {heading && (
            <h2 id="contact-faq" className="heading-section mt-2 text-center text-brand-green">
              {heading}
            </h2>
          )}

          <div className="mt-8 divide-y divide-brand-line rounded-[24px] border border-brand-line">
            {items.map((item) => (
              <details key={item.question} className="group px-5 py-4 sm:px-6">
                <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-bold text-brand-ink [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-brand-red transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-[15px] font-medium leading-7 text-brand-ink/80">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
