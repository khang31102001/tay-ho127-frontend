// Dữ liệu tĩnh của giao diện (tên hiển thị, ảnh dùng lại toàn site).
//
// KHÔNG còn chứa địa chỉ, số điện thoại, giờ mở cửa, link mạng xã hội: những thứ đó do Admin quản lý ở
// Tổ chức → Thông tin thương hiệu / Chi nhánh (Backend) và Site đọc qua `getSiteBrand()`
// (features/brand-profile/services/brand-public.service.ts) — xem features/brand-profile/utils/site-contact.ts để hiển thị.
export const site = {
  // Tên thương hiệu dùng cho metadata mặc định và aria-label.
  name: "Bánh Cuốn Tây Hồ 127",
  // Tagline mặc định cho metadata khi Admin chưa cấu hình SEO.
  tagline: "Bánh cuốn truyền thống, phục vụ nhanh, hương vị gia đình Bắc giữa Sài Gòn.",
  // Tài sản ảnh dùng lại toàn site.
  assets: {
    // Logo màu dùng trên nền sáng.
    logoColor: "/images/logo-color.png",
    // Logo trắng dùng trên nền tối.
    logoWhite: "/images/logo-white.png",
    // Mâm bánh cuốn tách nền dùng cho hero.
    heroPlatter: "/images/hero-platter.png",
    // Ảnh món ăn thực tế dùng cho card/menu.
    dishPhoto: "/images/banh-cuon-dish.jpg",
    // Badge Michelin được user cung cấp.
    michelin: "/images/michelin-2026.png",
    // Logo Google được user cung cấp.
    google: "/images/google-logo.png",
    // Background menu dùng cho menu section.
    menuBackground: "/images/background-menu.png",
    // Background checkout dùng cho checkout section.
    checkoutBackground: "/images/background-checkout.png",
  },
  // Domain mặc định của website (canonical/sitemap) khi NEXT_PUBLIC_SITE_URL chưa được đặt — xem lib/site-url.ts.
  following: {
    web: "https://tayho127.com",
  },
};
