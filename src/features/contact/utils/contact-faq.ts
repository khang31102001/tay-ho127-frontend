import { formatCurrency } from "@/core/utils/format-currency";
import type { SiteBrand } from "@/features/organization/brand-profile/types/brand-profile.types";
import {
  formatBrandAddress,
  getContactPhone,
  getSocialUrl,
} from "@/features/organization/brand-profile/utils/site-contact";

import { normalizeTime } from "./opening-hours";

export type ContactFaqItem = {
  question: string;
  answer: string;
};

/**
 * Câu hỏi thường gặp của trang Liên hệ, trả lời bằng dữ liệu thật: chi nhánh chính (Admin) và giá thấp nhất trong
 * Menu-SP "mon-yeu-thich" (Catalog) — không lấy cả thực đơn, kẻo ra giá của đồ uống/món thêm. Thiếu dữ liệu cho câu nào thì bỏ câu đó — không trả lời chung chung.
 * Chưa có câu "gửi xe ở đâu" vì Backend chưa có trường này.
 */
export function buildContactFaq(brand: SiteBrand, lowestPrice: number | null): ContactFaqItem[] {
  const items: ContactFaqItem[] = [];
  const address = formatBrandAddress(brand);
  const phone = getContactPhone(brand);
  const zaloUrl = getSocialUrl(brand, "zalo");
  const shopeeUrl = getSocialUrl(brand, "shopee");
  const opens = normalizeTime(brand.openTime);
  const closes = normalizeTime(brand.closeTime);
  const hoursNote = brand.businessHoursNote?.trim();

  if (opens && closes) {
    items.push({
      question: `${brand.name} mở cửa mấy giờ?`,
      answer: `Quán mở cửa từ ${opens} đến ${closes} tất cả các ngày trong tuần.${hoursNote ? ` ${hoursNote}` : ""}`,
    });
  }

  if (address) {
    items.push({
      question: `${brand.name} ở đâu?`,
      answer: `Quán ở ${address}. Bấm "Chỉ đường" ở đầu trang để mở Google Maps và đi thẳng tới quán.`,
    });
  }

  if (phone || zaloUrl) {
    const channels = [phone ? `gọi số ${phone}` : "", zaloUrl ? "nhắn Zalo cho quán" : ""].filter(Boolean).join(" hoặc ");
    items.push({
      question: "Muốn đặt bàn hoặc hỏi thông tin thì liên hệ thế nào?",
      answer: `Bạn ${channels} trong giờ mở cửa.`,
    });
  }

  if (shopeeUrl) {
    items.push({
      question: "Quán có bán mang về, giao hàng không?",
      answer: `Có. Bạn có thể đặt giao hàng qua ShopeeFood${phone ? ` hoặc gọi ${phone} để đặt trước rồi ghé lấy` : ""}.`,
    });
  }

  if (lowestPrice !== null) {
    items.push({
      question: "Một phần bánh cuốn giá bao nhiêu?",
      answer: `Các món được gọi nhiều nhất có giá từ ${formatCurrency(lowestPrice)} một phần. Giá từng món, món thêm và đồ uống xem tại trang Thực đơn.`,
    });
  }

  items.push({
    question: `${brand.name} có danh hiệu MICHELIN không?`,
    answer:
      "Có. Năm 2026, Cẩm nang MICHELIN Việt Nam đưa quán vào danh sách Bib Gourmand, danh hiệu dành cho những quán ăn ngon với giá hợp lý.",
  });

  return items;
}
