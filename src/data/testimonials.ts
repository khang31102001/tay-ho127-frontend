/**
 * Kiểu dữ liệu chuẩn của một đánh giá khách hàng.
 */
export interface TestimonialItem {
  id: number;
  customerName: string;
  avatarText: string;
  rating: number;
  timeAgo: string;
  content: string;
}

/**
 * Dữ liệu giả lập 6 đánh giá.
 *
 * Sau này có API, chỉ cần thay mảng này bằng dữ liệu API
 * nhưng vẫn giữ đúng cấu trúc TestimonialItem.
 */
export const testimonials: TestimonialItem[] = [
  {
    id: 1,
    customerName: "Hougusta",
    avatarText: "H",
    rating: 5,
    timeAgo: "1 tuần trước",
    content:
      "Một địa điểm tuyệt vời để thưởng thức bánh cuốn! Quán chuyên phục vụ bánh cuốn tươi nóng với các lựa chọn nhân mặn và chay, giá cả rất phải chăng.",
  },
  {
    id: 2,
    customerName: "Minh Anh",
    avatarText: "M",
    rating: 5,
    timeAgo: "2 tuần trước",
    content:
      "Bánh cuốn mềm, nóng và phần nhân được nêm nếm rất vừa miệng. Nhân viên thân thiện, phục vụ nhanh và không gian quán sạch sẽ.",
  },
  {
    id: 3,
    customerName: "Tuấn Nguyễn",
    avatarText: "T",
    rating: 4,
    timeAgo: "3 tuần trước",
    content:
      "Mình rất thích phần nước mắm của quán, vị đậm đà nhưng không quá ngọt. Chả lụa và bánh cuốn đều còn nóng khi được mang ra.",
  },
  {
    id: 4,
    customerName: "Ngọc Hà",
    avatarText: "N",
    rating: 5,
    timeAgo: "1 tháng trước",
    content:
      "Quán có nhiều lựa chọn món ăn, đặc biệt có cả món chay. Phần ăn đầy đặn, trình bày đẹp và giá hợp lý so với chất lượng.",
  },
  {
    id: 5,
    customerName: "Quang Huy",
    avatarText: "Q",
    rating: 5,
    timeAgo: "1 tháng trước",
    content:
      "Đã ghé quán nhiều lần và chất lượng luôn ổn định. Bánh được làm mới liên tục nên mềm, thơm và không bị khô.",
  },
  {
    id: 6,
    customerName: "Lan Phương",
    avatarText: "L",
    rating: 5,
    timeAgo: "2 tháng trước",
    content:
      "Không gian gần gũi, món ăn ngon và phục vụ chu đáo. Đây là một trong những địa điểm ăn sáng mình thường xuyên lựa chọn.",
  },
];