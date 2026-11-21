/**
 * Dải nền tối nằm sau Header cố định (fixed) ở đầu trang.
 *
 * Header (variant="dark") trong suốt + chữ trắng khi chưa scroll, nên mọi trang
 * không có Hero tối (chi tiết món ăn, chi tiết tin tức, ...) phải tự cấp nền
 * tối ở đỉnh trang — nếu không chữ trắng chìm vào nền kem. Cùng công thức nền
 * với MenuHero/NewsHero (bg-brand-ink + bg-hero). Chiều cao = chiều cao Header
 * (h-[64px] / md:h-[68px]) để Header luôn nằm gọn trên dải này.
 */
export function HeaderBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="h-[64px] w-full bg-brand-ink bg-hero md:h-[68px]"
    />
  );
}
