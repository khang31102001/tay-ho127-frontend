// Import ButtonLink để đưa người dùng về trang chủ.
import { ButtonLink } from "@/shared/ui/ButtonLink";
// Import Container chuẩn.
import { Container } from "@/shared/ui/Container";

// Trang 404 khi đường dẫn không tồn tại.
export default function NotFound() {
  // Render thông báo lỗi thân thiện.
  return (
    <section className="bg-brand-cream py-24">
      <Container className="text-center">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">404</p>
        <h1 className="heading-section mt-4">Không tìm thấy trang</h1>
        <p className="body-lead mx-auto mt-5 max-w-xl">Đường dẫn này chưa có trong website. Quay lại trang chủ để tiếp tục xem nội dung.</p>
        <ButtonLink href="/" variant="primary" className="mt-8">Về trang chủ</ButtonLink>
      </Container>
    </section>
  );
}
