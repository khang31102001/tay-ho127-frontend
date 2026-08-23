// Tất cả dữ liệu hiển thị gom tại đây để tránh hard-code rải rác trong component.
export const site = {
  // Tên thương hiệu dùng cho metadata, footer và aria-label.
  name: "Bánh Cuốn Tây Hồ 127",
  // Tagline ngắn dùng ở hero và SEO description.
  tagline: "Bánh cuốn truyền thống, phục vụ nhanh, hương vị gia đình Bắc giữa Sài Gòn.",
  // Địa chỉ mẫu để hiển thị trên CTA và footer.
  address: "127 Đinh Tiên Hoàng, Đa Kao, Quận 1, TP. Hồ Chí Minh",
  // Số điện thoại mẫu, bạn đổi lại nếu cần.
  phone: "0900 127 127",
  // Giờ mở cửa mẫu, dữ liệu tập trung để đổi một lần.
  openingHours: "06:00 - 21:30 hằng ngày",
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
    /// background menu dùng cho menu section.
    menuBackground: "/images/background-menu.png",
     /// background checkout dùng cho checkout section.
    checkoutBackground: "/images/background-checkout.png",
  },
};

export const brand = {
  name: "Bánh Cuốn Tây Hồ 127",
  // Tagline ngắn dùng ở hero và SEO description.
  tagline: "Bánh cuốn truyền thống, phục vụ nhanh, hương vị gia đình  giữa Sài Gòn.",
  // Địa chỉ mẫu để hiển thị trên CTA và footer.
  address: "127 Đinh Tiên Hoàng, Đa Kao, Quận 1, TP. Hồ Chí Minh",
  // Số điện thoại mẫu, bạn đổi lại nếu cần.
  phone: "0900 127 127",
  // Giờ mở cửa mẫu, dữ liệu tập trung để đổi một lần.
  openingHours: "06:00 - 21:30 hằng ngày",
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
  },
  following: {
    web: "https://tayho127.com",
    facebook: "https://www.facebook.com/tayho127",
    instagram: "https://www.instagram.com/tayho127",
    tiktok: "https://www.tiktok.com/@tayho127",
    shopee: "https://shopee.vn/tayho127",
  }
}

// Menu điều hướng tập trung: thêm/xóa page tại đây, Navbar và Footer tự ăn theo.
export const navItems = [
  // Link về trang chủ.
  { label: "Trang chủ", href: "/" },
  // Link sang trang thực đơn.
  { label: "Thực đơn", href: "/thuc-don" },

];

// Điểm chứng thực thương hiệu dùng ở hero và proof section.
export const brandProofs = [
  // Google là tín hiệu tìm kiếm/niềm tin đại chúng.
  { title: "Google", value: "Tìm kiếm nhanh", description: "Tối ưu hiển thị cho khách muốn tìm địa điểm ăn gần nhất." },
  // Michelin là tín hiệu định vị cao cấp/ẩm thực.
  { title: "Michelin 2026", value: "Gợi ý ẩm thực", description: "Tận dụng biểu tượng đỏ để tăng cảm giác uy tín và đáng thử." },
  // Di sản địa phương là lợi thế cạnh tranh.
  { title: "Tây Hồ 127", value: "Hương vị truyền thống", description: "Tập trung vào món lõi: bánh cuốn nóng, chả, rau sống và nước mắm." },
];

// Danh sách lợi thế bán hàng trên trang chủ.
export const highlights = [
  // USP về sản phẩm.
  { title: "Bánh cuốn nóng", text: "Lớp bánh mềm, mỏng, cuốn nhân thịt nấm, phủ hành phi giòn." },
  // USP về trải nghiệm.
  { title: "Phục vụ nhanh", text: "Phù hợp ăn sáng, ăn trưa văn phòng và khách du lịch cần bữa gọn." },
  // USP về cảm xúc thương hiệu.
  { title: "Vị Bắc thân quen", text: "Rau thơm, chả, nước mắm chua ngọt tạo cảm giác bữa ăn gia đình." },
];

// Dữ liệu món ăn hiển thị ở preview và trang thực đơn.
export const dishes = [
  // Món chủ lực cần ưu tiên xuất hiện đầu tiên.
  {
    name: "Bánh cuốn đặc biệt Tây Hồ",
    price: "75.000đ",
    badge: "Signature",
    description: "Bánh cuốn nhân thịt nấm, chả lụa, nem, rau thơm, hành phi và nước mắm pha.",
    image: "/images/hero-platter.png",
  },
  // Món cơ bản để khách mới dễ chọn.
  {
    name: "Bánh cuốn nhân thịt",
    price: "55.000đ",
    badge: "Bán chạy",
    description: "Bánh cuốn nóng, nhân thịt băm nấm mèo, ăn kèm giá, rau thơm và hành phi.",
    image: "/images/banh-cuon-dish.jpg",
  },
  // Món tăng giá trị đơn hàng.
  {
    name: "Bánh cuốn chả lụa",
    price: "65.000đ",
    badge: "Đậm vị",
    description: "Phần bánh cuốn truyền thống ăn cùng chả lụa, dưa leo, rau thơm và nước mắm." ,
    image: "/images/banh-cuon-dish.jpg",
  },
  // Combo cho khách đi nhóm hoặc khách muốn đủ topping.
  {
    name: "Combo gia đình",
    price: "189.000đ",
    badge: "Cho 2-3 người",
    description: "Mâm bánh cuốn nhiều topping, chả, rau sống, nước chấm và phần ăn chia sẻ.",
    image: "/images/hero-platter.png",
  },
];

// Nhóm món phụ và đồ uống cho trang thực đơn.
export const sideItems = [
  // Món phụ bổ sung protein.
  { name: "Chả lụa thêm", price: "25.000đ" },
  // Món phụ tạo độ giòn.
  { name: "Hành phi thêm", price: "10.000đ" },
  // Món phụ cân bằng vị.
  { name: "Rau sống thêm", price: "12.000đ" },
  // Đồ uống phổ biến.
  { name: "Trà đá", price: "5.000đ" },
  // Đồ uống đóng chai.
  { name: "Nước suối", price: "10.000đ" },
  // Đồ uống truyền thống.
  { name: "Sữa đậu nành", price: "18.000đ" },
];

// Nội dung câu chuyện thương hiệu để tránh viết trực tiếp trong page.
export const storyBlocks = [
  // Khối nói về di sản.
  "Tây Hồ 127 được định vị như một quán bánh cuốn truyền thống: món ăn đơn giản, nguyên liệu quen thuộc, nhưng cách trình bày và trải nghiệm phải sạch, nhanh và đáng tin.",
  // Khối nói về thiết kế website.
  "Website dùng hệ màu đỏ - xanh từ logo, nền kem ấm và ảnh món ăn lớn để tạo cảm giác ngon miệng, rõ thương hiệu và dễ đặt món trên cả desktop lẫn mobile.",
];
