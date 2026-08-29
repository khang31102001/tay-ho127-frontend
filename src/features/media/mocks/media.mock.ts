import type { ManagedMedia } from "../types/media.types";

/**
 * `url` seed trỏ vào ảnh có sẵn trong public/images để preview hoạt động thật
 * trong lúc chưa có upload service thật.
 */
export const SEED_MEDIA: ManagedMedia[] = [
  {
    id: "media-banh-cuon-dish",
    fileName: "banh-cuon-dish.jpg",
    url: "/images/banh-cuon-dish.jpg",
    type: "image",
    altText: "Đĩa bánh cuốn Tây Hồ 127",
    size: 182_000,
    status: "active",
  },
  {
    id: "media-hero-platter",
    fileName: "hero-platter.png",
    url: "/images/hero-platter.png",
    type: "image",
    altText: "Mâm bánh cuốn đầy đủ",
    size: 640_000,
    status: "active",
  },
  {
    id: "media-hero-cooking",
    fileName: "hero-cooking.png",
    url: "/images/hero-cooking.png",
    type: "image",
    altText: "Quá trình chế biến bánh cuốn",
    size: 512_000,
    status: "active",
  },
  {
    id: "media-logo-color",
    fileName: "logo-color.png",
    url: "/images/logo-color.png",
    type: "image",
    altText: "Logo Tây Hồ 127",
    size: 48_000,
    status: "active",
  },
  {
    id: "media-review-card",
    fileName: "review-card.png",
    url: "/images/review-card.png",
    type: "image",
    altText: "Ảnh đánh giá khách hàng",
    size: 96_000,
    status: "inactive",
  },
  {
    id: "media-promotion-zone-1",
    fileName: "promotion-zone-1.png",
    url: "/images/promotion-zone-1.png",
    type: "image",
    altText: "Ưu đãi bánh cuốn Tây Hồ",
    size: 720_000,
    status: "active",
  },
  {
    id: "media-promotion-zone-2",
    fileName: "promotion-zone-2.png",
    url: "/images/promotion-zone-2.png",
    type: "image",
    altText: "Ưu đãi bánh cuốn Tây Hồ (bản mobile)",
    size: 480_000,
    status: "active",
  },
];
