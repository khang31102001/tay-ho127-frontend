import type { ManagedArticle } from "../types/article.types";

/**
 * MOCK CONTRACT: seed tối thiểu cho Phase 04 (Article Management). 2 bài đã
 * xuất bản (khớp categoryId/tagIds với seed của article-categories/article-tags)
 * + 1 bài nháp để minh họa luồng Draft → Publish.
 */
export const SEED_ARTICLES: ManagedArticle[] = [
  {
    id: "article-cong-thuc-banh-cuon-truyen-thong",
    title: "Bí quyết tráng bánh cuốn mỏng tang chuẩn vị Bắc",
    slug: "bi-quyet-trang-banh-cuon-mong-tang-chuan-vi-bac",
    summary:
      "Chia sẻ từ bếp Tây Hồ 127: cách pha bột, canh lửa và tráng bánh để có lớp bánh cuốn mỏng, dai nhẹ, không rách.",
    content:
      "<p>Bánh cuốn ngon bắt đầu từ khâu pha bột — tỷ lệ bột gạo, bột năng và nước phải vừa đủ để lớp bánh vừa mỏng vừa dai.</p><h2>Ba bước không thể bỏ qua</h2><ul><li>Ngâm gạo qua đêm rồi xay mịn</li><li>Tráng bánh trên lửa vừa, không quá to</li><li>Cuốn nhân ngay khi bánh còn nóng để không bị rách</li></ul><p>Tại Tây Hồ 127, mỗi mẻ bột đều được pha thủ công mỗi sáng để đảm bảo độ tươi.</p>",
    featuredMediaId: "media-hero-cooking",
    categoryId: "artcat-cong-thuc",
    tagIds: ["arttag-truyen-thong", "arttag-cong-thuc"],
    authorName: "Đội ngũ Tây Hồ 127",
    status: "published",
    publishedAt: "2026-01-15T00:00:00.000Z",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "article-cau-chuyen-nua-the-ky",
    title: "Nửa thế kỷ giữ lửa hương vị bánh cuốn Hà Nội",
    slug: "nua-the-ky-giu-lua-huong-vi-banh-cuon-ha-noi",
    summary:
      "Từ một quán nhỏ ở phố cổ năm 1972 đến chuỗi nhà hàng hôm nay — hành trình giữ trọn công thức gia truyền của Tây Hồ 127.",
    content:
      "<p>Năm 1972, một quán bánh cuốn nhỏ mở cửa tại phố cổ Hà Nội — khởi đầu cho hành trình hơn 50 năm của Tây Hồ 127.</p><blockquote>Chúng tôi tin rằng hương vị truyền thống là thứ không thể vội vàng.</blockquote><p>Ngày nay, dù đã phát triển thành chuỗi nhà hàng, mỗi chi nhánh vẫn tráng bánh thủ công mỗi ngày theo đúng công thức ban đầu.</p>",
    featuredMediaId: "media-banh-cuon-dish",
    categoryId: "artcat-cau-chuyen",
    tagIds: ["arttag-truyen-thong", "arttag-cau-chuyen"],
    authorName: "Đội ngũ Tây Hồ 127",
    status: "published",
    publishedAt: "2026-02-01T00:00:00.000Z",
    createdAt: "2026-01-28T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "article-uu-dai-thang-nay-nhap",
    title: "Ưu đãi tháng này: giảm 10% cho đơn từ 200.000đ",
    slug: "uu-dai-thang-nay-giam-10-cho-don-tu-200000d",
    summary: "Đặt hàng qua website trong tháng để nhận ưu đãi giảm giá trực tiếp trên hoá đơn.",
    content:
      "<p>Trong tháng này, mọi đơn hàng từ 200.000đ đặt qua website sẽ được giảm 10% trực tiếp.</p><p>Áp dụng cho mọi món trong thực đơn, không giới hạn số lần sử dụng.</p>",
    featuredMediaId: "media-review-card",
    categoryId: "artcat-tin-tuc",
    tagIds: ["arttag-uu-dai"],
    authorName: "Đội ngũ Tây Hồ 127",
    status: "draft",
    publishedAt: null,
    createdAt: "2026-02-20T00:00:00.000Z",
    updatedAt: "2026-02-20T00:00:00.000Z",
  },
];
