// SERVER-ONLY: gọi Backend qua features/content/public + media công khai — chỉ dùng trong Server Component.
// Import thẳng service media (không qua barrel) — barrel features/media re-export cả UI Admin.
import { listPublishedPageSections, type PublicPageSection } from "@/features/content/public";
import { listMedia } from "@/features/media/services/public-media.service";
import type { ManagedMedia } from "@/features/media/types/media.types";

/** Ảnh đã đổi id → URL, sẵn sàng cho next/image. */
export type HomeStoryImage = {
  src: string;
  alt: string;
};

/** Khối "Câu chuyện thương hiệu" của trang chủ, đã ghép với ảnh. */
export type HomeStory = {
  /** Phần tiêu đề màu đỏ. */
  heading: string;
  /** Phần tiêu đề màu xanh nối tiếp — rỗng thì không hiện. */
  subheading: string;
  paragraphs: string[];
  /** Hiện nút khi có cả nhãn lẫn link. */
  cta: { label: string; href: string } | null;
  images: {
    /** Ảnh trên cột trái. */
    top: HomeStoryImage;
    /** Ảnh dưới cột trái (chỉ hiện từ sm trở lên). */
    bottom: HomeStoryImage;
    /** Ảnh dọc bên phải = ảnh chính của section. */
    side: HomeStoryImage;
  };
};

const HOME_PAGE_SLUG = "/";
const STORY_SECTION_KIND = "story";

const DEFAULT_IMAGES: HomeStory["images"] = {
  top: { src: "/images/banh-cuon-dish.jpg", alt: "Bánh cuốn Tây Hồ" },
  bottom: { src: "/images/banh-cuon-dish.jpg", alt: "Món ăn truyền thống của Tây Hồ" },
  side: { src: "/images/story-col-1.png", alt: "Câu chuyện Bánh Cuốn Tây Hồ" },
};

/**
 * Nội dung mặc định — dùng khi Backend chưa có section "story" trên trang chủ (Admin → Nội dung → Trang →
 * Trang chủ → Sections), page chưa xuất bản hoặc Backend lỗi, để trang chủ không bao giờ trống.
 */
const DEFAULT_STORY: HomeStory = {
  heading: "Hơn 6 thập kỷ",
  subheading: "gìn giữ vị xưa",
  paragraphs: [
    "Bánh Cuốn Tây Hồ bắt đầu từ năm 1961, khi một tiệm bánh cuốn nhỏ mở bán cạnh đền thờ cụ Phan Châu Trinh ở Sài Gòn. Thực khách quen gọi quán theo hiệu \"Tây Hồ\" của cụ, và cái tên ấy theo quán về tới số 127 Đinh Tiên Hoàng hôm nay.",
    "Hơn 60 năm qua, quán vẫn giữ cách làm truyền thống: bánh tráng mỏng từ bột gạo mỗi ngày, nhân thịt thơm ngon và nước chấm theo công thức gia truyền.",
    "Năm 2026, Bánh Cuốn Tây Hồ 127 được Cẩm nang MICHELIN đưa vào danh sách Bib Gourmand, dành cho những quán ngon với giá hợp lý. Với chúng tôi, đó là lời nhắc tiếp tục giữ trọn hương vị đã làm nên tên quán.",
  ],
  cta: { label: "Đọc câu chuyện Tây Hồ 127", href: "/gioi-thieu" },
  images: DEFAULT_IMAGES,
};

/** Body là văn bản thuần: các đoạn cách nhau bằng dòng trống. */
function splitParagraphs(body: string | null): string[] {
  return (body ?? "")
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Ảnh không tìm thấy (id sai, media đã tắt, host chưa khai báo) → giữ ảnh mặc định của vị trí đó. */
function resolveImage(
  mediaId: string | null | undefined,
  mediaById: Map<string, ManagedMedia>,
  fallback: HomeStoryImage,
): HomeStoryImage {
  const media = mediaId ? mediaById.get(mediaId) : undefined;
  return media ? { src: media.url, alt: media.altText || fallback.alt } : fallback;
}

async function toHomeStory(section: PublicPageSection): Promise<HomeStory> {
  const [topId, bottomId] = section.galleryMediaIds;
  const hasImages = Boolean(section.mediaId || topId || bottomId);
  const mediaById = hasImages
    ? new Map((await listMedia()).map((media) => [media.id, media]))
    : new Map<string, ManagedMedia>();

  return {
    heading: section.heading ?? "",
    subheading: section.subheading ?? "",
    paragraphs: splitParagraphs(section.body),
    cta: section.ctaLabel && section.ctaUrl ? { label: section.ctaLabel, href: section.ctaUrl } : null,
    images: {
      top: resolveImage(topId, mediaById, DEFAULT_IMAGES.top),
      bottom: resolveImage(bottomId, mediaById, DEFAULT_IMAGES.bottom),
      side: resolveImage(section.mediaId, mediaById, DEFAULT_IMAGES.side),
    },
  };
}

/**
 * Câu chuyện thương hiệu trên trang chủ = section "story" đầu tiên (theo thứ tự) của page "/" do Admin quản lý.
 * Cache 60 giây theo public-content.service: Admin sửa → trang chủ đổi trong tối đa 60 giây.
 */
export async function getHomeStory(): Promise<HomeStory> {
  const sections = await listPublishedPageSections(HOME_PAGE_SLUG);
  const storySection = sections?.find((section) => section.sectionKind === STORY_SECTION_KIND);

  return storySection ? toHomeStory(storySection) : DEFAULT_STORY;
}
