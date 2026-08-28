import type { ManagedCategory } from "../types/category.types";

/**
 * Phân cấp 3 tầng group → category → subCategory, giữ nguyên id/tên/sortOrder
 * từ menu-api-response.mock.json cũ (nguồn dữ liệu /thuc-don trước khi gộp
 * về Catalog) để không đổi cấu trúc thực đơn đang hiển thị trên site.
 */
export const SEED_CATEGORIES: ManagedCategory[] = [
  // --- Group (tầng gốc) ---
  { id: "group-food", name: "Món ăn", parentId: null, sortOrder: 1, status: "active" },
  { id: "group-drink", name: "Đồ uống", parentId: null, sortOrder: 2, status: "active" },
  { id: "group-service", name: "Dịch vụ & phụ thu", parentId: null, sortOrder: 3, status: "active" },

  // --- Category (tầng giữa, dưới group-food) ---
  { id: "cat-food-banh-cuon", name: "Bánh cuốn", parentId: "group-food", sortOrder: 1, status: "active" },
  { id: "cat-food-mon-chay", name: "Món chay", parentId: "group-food", sortOrder: 2, status: "active" },
  { id: "cat-food-mon-them", name: "Món thêm", parentId: "group-food", sortOrder: 3, status: "active" },
  { id: "cat-food-phu-thu", name: "Phụ thu", parentId: "group-food", sortOrder: 4, status: "active" },
  { id: "cat-food-banh-ngot", name: "Bánh ngọt", parentId: "group-food", sortOrder: 5, status: "active" },
  { id: "cat-food-hang-dong-goi", name: "Hàng đóng gói", parentId: "group-food", sortOrder: 6, status: "active" },
  { id: "cat-food-gia-vi", name: "Gia vị", parentId: "group-food", sortOrder: 7, status: "active" },

  // --- Category (tầng giữa, dưới group-drink) ---
  { id: "cat-drink-do-uong", name: "Đồ uống", parentId: "group-drink", sortOrder: 1, status: "active" },

  // --- Category (tầng giữa, dưới group-service) ---
  { id: "cat-service-phu-thu", name: "Phụ thu", parentId: "group-service", sortOrder: 1, status: "active" },

  // --- SubCategory (tầng lá, dưới cat-food-banh-cuon) ---
  { id: "subcat-food-banh-cuon-banh-cuon-nhan", name: "Bánh cuốn nhân", parentId: "cat-food-banh-cuon", sortOrder: 1, status: "active" },
  { id: "subcat-food-banh-cuon-banh-uot", name: "Bánh ướt", parentId: "cat-food-banh-cuon", sortOrder: 2, status: "active" },

  // --- SubCategory (dưới cat-food-mon-chay) ---
  { id: "subcat-food-mon-chay-banh-cuon-chay", name: "Bánh cuốn chay", parentId: "cat-food-mon-chay", sortOrder: 1, status: "active" },
  { id: "subcat-food-mon-chay-banh-uot-chay", name: "Bánh ướt chay", parentId: "cat-food-mon-chay", sortOrder: 2, status: "active" },
  { id: "subcat-food-mon-chay-mon-chay-an-kem", name: "Món chay ăn kèm", parentId: "cat-food-mon-chay", sortOrder: 3, status: "active" },

  // --- SubCategory (dưới cat-food-mon-them) ---
  { id: "subcat-food-mon-them-nem-cha", name: "Nem/Chả", parentId: "cat-food-mon-them", sortOrder: 1, status: "active" },
  { id: "subcat-food-mon-them-banh-an-kem", name: "Bánh ăn kèm", parentId: "cat-food-mon-them", sortOrder: 2, status: "active" },

  // --- SubCategory (dưới cat-food-phu-thu) ---
  { id: "subcat-food-phu-thu-gia-vi-an-kem", name: "Gia vị/Ăn kèm", parentId: "cat-food-phu-thu", sortOrder: 1, status: "active" },

  // --- SubCategory (dưới cat-food-banh-ngot) ---
  { id: "subcat-food-banh-ngot-banh-ngot", name: "Bánh ngọt", parentId: "cat-food-banh-ngot", sortOrder: 1, status: "active" },

  // --- SubCategory (dưới cat-food-hang-dong-goi) ---
  { id: "subcat-food-hang-dong-goi-nem-cha-dong-goi", name: "Nem/Chả đóng gói", parentId: "cat-food-hang-dong-goi", sortOrder: 1, status: "active" },

  // --- SubCategory (dưới cat-food-gia-vi) ---
  { id: "subcat-food-gia-vi-tinh-chat-gia-vi", name: "Tinh chất/Gia vị", parentId: "cat-food-gia-vi", sortOrder: 1, status: "active" },

  // --- SubCategory (dưới cat-drink-do-uong) ---
  { id: "subcat-drink-do-uong-ca-phe", name: "Cà phê", parentId: "cat-drink-do-uong", sortOrder: 1, status: "active" },
  { id: "subcat-drink-do-uong-sua", name: "Sữa", parentId: "cat-drink-do-uong", sortOrder: 2, status: "active" },
  { id: "subcat-drink-do-uong-nuoc-ngot", name: "Nước ngọt", parentId: "cat-drink-do-uong", sortOrder: 3, status: "active" },
  { id: "subcat-drink-do-uong-nuoc-tang-luc", name: "Nước tăng lực", parentId: "cat-drink-do-uong", sortOrder: 4, status: "active" },
  { id: "subcat-drink-do-uong-nuoc-dong-chai", name: "Nước đóng chai", parentId: "cat-drink-do-uong", sortOrder: 5, status: "active" },
  { id: "subcat-drink-do-uong-nuoc-ep", name: "Nước ép", parentId: "cat-drink-do-uong", sortOrder: 6, status: "active" },
  { id: "subcat-drink-do-uong-bia", name: "Bia", parentId: "cat-drink-do-uong", sortOrder: 7, status: "active" },

  // --- SubCategory (dưới cat-service-phu-thu) ---
  { id: "subcat-service-phu-thu-tra-khan", name: "Trà/Khăn", parentId: "cat-service-phu-thu", sortOrder: 1, status: "active" },
];
