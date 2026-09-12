import { testimonials, type TestimonialItem } from "../mocks/testimonials.mock";

/**
 * MOCK CONTRACT — chưa có Backend/CMS quản lý đánh giá khách hàng thật.
 * Component không được import thẳng `../mocks/testimonials.mock` (vi phạm
 * boundary Component → Service → Mock) — mọi nơi cần danh sách đánh giá phải
 * gọi hàm này. Khi có CMS/Backend thật, chỉ cần thay nội dung hàm này.
 */
export async function listTestimonials(): Promise<TestimonialItem[]> {
  return testimonials;
}

export type { TestimonialItem };
