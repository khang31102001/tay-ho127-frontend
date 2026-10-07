"use client";

import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

type SiteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Error boundary cho mọi trang User Site (nằm trong layout nên Header/Footer vẫn hiển thị).
export default function SiteError({ error, reset }: SiteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="bg-brand-cream py-24">
      <Container className="text-center">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">Lỗi</p>
        <h1 className="heading-section mt-4">Đã có lỗi xảy ra</h1>
        <p className="body-lead mx-auto mt-5 max-w-xl">
          Trang này tạm thời không tải được. Vui lòng thử lại hoặc quay về trang chủ.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="focus-ring rounded-full bg-brand-red px-6 py-3 text-sm font-bold text-white">
            Thử lại
          </button>
          <ButtonLink href="/" variant="primary">Về trang chủ</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
