import type { SectionType } from "./page-section.types";

/**
 * Các ô (slot) mà Site đặt cho từng trang, theo MÃ TRANG (Page.pageKey — cố định, không phải id tự sinh). Site chỉ
 * hiển thị section có key nằm trong danh sách này, theo thứ tự Admin sắp; ô không có section / bị ẩn / thiếu trường
 * bắt buộc thì không hiện. `isCore` = nội dung chính của trang, luôn hiển thị (Admin chỉ đổi được vị trí).
 * Thêm ô mới = thêm phần tử ở đây + component tương ứng ở trang Site (app/(site)/.../page.tsx).
 * Đề xuất: document/04-nghiep-vu/de-xuat/QUAN-LY-SECTION-TRANG.md.
 */
export type PageSlotTemplate = {
  key: string;
  sectionType: SectionType;
  label: string;
  /** Mô tả ngắn cho Admin: ô này hiện gì, trường nào bắt buộc. */
  hint: string;
  isCore?: boolean;
};

const CORE_HINT = "Nội dung chính của trang — luôn hiển thị, ẩn/xóa không có tác dụng; chỉ đổi được vị trí.";

export const PAGE_SLOT_TEMPLATES: Record<string, PageSlotTemplate[]> = {
  home: [
    {
      key: "hero",
      sectionType: "hero",
      label: "Hero đầu trang",
      hint: "Bắt buộc Heading (chữ lớn). Eyebrow = chữ nhỏ phía trên; Nội dung = slogan, mỗi dòng một câu; CTA = nút chính.",
    },
    { key: "story", sectionType: "story", label: "Câu chuyện thương hiệu", hint: "Bắt buộc Heading." },
    {
      key: "promotion",
      sectionType: "promotion",
      label: "Ưu đãi (banner)",
      hint: "Ảnh lấy từ Banner vị trí HOME_PROMOTION đang chạy; không có banner thì không hiện.",
    },
    {
      key: "favorites",
      sectionType: "highlight",
      label: "Món yêu thích",
      hint: "Món lấy từ thực đơn bán hàng “mon-yeu-thich”; không có món thì không hiện.",
    },
    {
      key: "stats",
      sectionType: "stats",
      label: "Số liệu",
      hint: "Bắt buộc Heading và ít nhất 1 số liệu. Ảnh = ảnh hoạt động phía trên. Hiện chung khối nền với “Giải thưởng”.",
    },
    {
      key: "award",
      sectionType: "award",
      label: "Giải thưởng (thẻ MICHELIN)",
      hint: "Bắt buộc Heading. Hiện chung khối nền với “Số liệu”.",
    },
    {
      key: "testimonials",
      sectionType: "testimonial",
      label: "Khách hàng nói gì",
      hint: "Đánh giá hiện lấy từ dữ liệu mẫu (chưa có module Đánh giá).",
    },
  ],
  "gioi-thieu": [
    {
      key: "hero",
      sectionType: "hero",
      label: "Hero đầu trang",
      hint: "Bắt buộc Heading. Eyebrow = nhãn nhỏ; Nội dung = mô tả.",
    },
    {
      key: "timeline",
      sectionType: "timeline",
      label: "Mốc thời gian",
      hint: "Bắt buộc ít nhất 1 mốc. Eyebrow = nhãn nhỏ (vd. “Từ 1961 đến nay”), Heading = tiêu đề.",
    },
    {
      key: "signature-dish",
      sectionType: "introduction",
      label: "Món làm nên tên quán",
      hint: "Bắt buộc Heading. Nội dung = các ý, mỗi dòng một ý; Ảnh = ảnh món.",
    },
    {
      key: "michelin",
      sectionType: "award",
      label: "Ghi nhận MICHELIN",
      hint: "Bắt buộc Heading. Nội dung = các đoạn (cách nhau 1 dòng trống); danh sách = link nguồn báo chí (Tiêu đề + Link).",
    },
  ],
  "thuc-don": [
    {
      key: "hero",
      sectionType: "hero",
      label: "Hero đầu trang",
      hint: "Bắt buộc Heading (dòng 1). Subheading = dòng 2; Eyebrow = nhãn nhỏ; Nội dung = mô tả; Ảnh = ảnh mâm bánh.",
    },
    { key: "menu", sectionType: "core", label: "Lưới thực đơn", hint: CORE_HINT, isCore: true },
  ],
  "tin-tuc": [
    {
      key: "hero",
      sectionType: "hero",
      label: "Hero đầu trang",
      hint: "Bắt buộc Heading. Eyebrow = nhãn nhỏ; Nội dung = mô tả.",
    },
    { key: "articles", sectionType: "core", label: "Danh sách bài viết", hint: CORE_HINT, isCore: true },
  ],
  "lien-he": [
    {
      key: "hero",
      sectionType: "hero",
      label: "Hero đầu trang",
      hint: "Eyebrow = nhãn nhỏ. Tên quán, địa chỉ, giờ mở cửa, nút gọi/chỉ đường lấy từ Thông tin thương hiệu / Chi nhánh.",
    },
    { key: "contact-info", sectionType: "core", label: "Thông tin liên hệ & bản đồ", hint: CORE_HINT, isCore: true },
    {
      key: "visit-intro",
      sectionType: "introduction",
      label: "Ghé quán",
      hint: "Bắt buộc Heading. Câu địa chỉ đầu đoạn tự sinh từ Chi nhánh; Nội dung = các đoạn tiếp theo; CTA = link cuối.",
    },
    {
      key: "featured-dishes",
      sectionType: "highlight",
      label: "Món được gọi nhiều",
      hint: "Món lấy từ thực đơn bán hàng “mon-yeu-thich”. Eyebrow/Heading = tiêu đề; CTA = nút xem thực đơn.",
    },
    {
      key: "faq",
      sectionType: "faq",
      label: "Câu hỏi thường gặp",
      hint: "Câu hỏi về địa chỉ/giờ/giá tự sinh từ dữ liệu; danh sách ở đây = câu hỏi thêm, hiện sau.",
    },
  ],
};

/** Ô của trang theo mã trang; trang không có mã / không có template → rỗng (chỉ có section tự do). */
export function getPageSlotTemplates(pageKey: string | null | undefined): PageSlotTemplate[] {
  return pageKey ? (PAGE_SLOT_TEMPLATES[pageKey] ?? []) : [];
}
