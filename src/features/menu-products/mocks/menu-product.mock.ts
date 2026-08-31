import type { ManagedMenuProduct } from "../types/menu-product.types";

/**
 * 2 nhóm MenuProduct chi phối Customer Site thật (xem
 * features/menu/services/menu.service.ts):
 * - menu-thuc-don-chinh: 46 dòng, đúng thứ tự món trên trang /thuc-don hôm nay.
 * - menu-mon-yeu-thich: 12 dòng, đúng thứ tự carousel "yêu thích" trên trang chủ.
 */
export const SEED_MENU_PRODUCTS: ManagedMenuProduct[] = [
  // ================= menu-thuc-don-chinh (46 món, /thuc-don) =================
  { id: "mp-tdc-01", menuId: "menu-thuc-don-chinh", productId: "product-bc001", sortOrder: 1, isAvailable: true },
  { id: "mp-tdc-02", menuId: "menu-thuc-don-chinh", productId: "product-bc003", sortOrder: 2, isAvailable: true },
  { id: "mp-tdc-03", menuId: "menu-thuc-don-chinh", productId: "product-bc004", sortOrder: 3, isAvailable: true },
  { id: "mp-tdc-04", menuId: "menu-thuc-don-chinh", productId: "product-bc005", sortOrder: 4, isAvailable: true },
  { id: "mp-tdc-05", menuId: "menu-thuc-don-chinh", productId: "product-bc002", sortOrder: 5, isAvailable: true },
  { id: "mp-tdc-06", menuId: "menu-thuc-don-chinh", productId: "product-bc006", sortOrder: 6, isAvailable: true },
  { id: "mp-tdc-07", menuId: "menu-thuc-don-chinh", productId: "product-bc007", sortOrder: 7, isAvailable: true },
  { id: "mp-tdc-08", menuId: "menu-thuc-don-chinh", productId: "product-bc008", sortOrder: 8, isAvailable: true },
  { id: "mp-tdc-09", menuId: "menu-thuc-don-chinh", productId: "product-bc010", sortOrder: 9, isAvailable: true },
  { id: "mp-tdc-10", menuId: "menu-thuc-don-chinh", productId: "product-bc011", sortOrder: 10, isAvailable: true },
  { id: "mp-tdc-11", menuId: "menu-thuc-don-chinh", productId: "product-bc009", sortOrder: 11, isAvailable: true },
  { id: "mp-tdc-12", menuId: "menu-thuc-don-chinh", productId: "product-tp009", sortOrder: 12, isAvailable: true },
  { id: "mp-tdc-13", menuId: "menu-thuc-don-chinh", productId: "product-tp010", sortOrder: 13, isAvailable: true },
  { id: "mp-tdc-14", menuId: "menu-thuc-don-chinh", productId: "product-tp001", sortOrder: 14, isAvailable: true },
  { id: "mp-tdc-15", menuId: "menu-thuc-don-chinh", productId: "product-tp002", sortOrder: 15, isAvailable: true },
  { id: "mp-tdc-16", menuId: "menu-thuc-don-chinh", productId: "product-tp003", sortOrder: 16, isAvailable: true },
  { id: "mp-tdc-17", menuId: "menu-thuc-don-chinh", productId: "product-tp004", sortOrder: 17, isAvailable: true },
  { id: "mp-tdc-18", menuId: "menu-thuc-don-chinh", productId: "product-tp005", sortOrder: 18, isAvailable: true },
  { id: "mp-tdc-19", menuId: "menu-thuc-don-chinh", productId: "product-tp006", sortOrder: 19, isAvailable: true },
  { id: "mp-tdc-20", menuId: "menu-thuc-don-chinh", productId: "product-tp007", sortOrder: 20, isAvailable: true },
  { id: "mp-tdc-21", menuId: "menu-thuc-don-chinh", productId: "product-tp008", sortOrder: 21, isAvailable: true },
  { id: "mp-tdc-22", menuId: "menu-thuc-don-chinh", productId: "product-du001", sortOrder: 22, isAvailable: true },
  { id: "mp-tdc-23", menuId: "menu-thuc-don-chinh", productId: "product-du002", sortOrder: 23, isAvailable: true },
  { id: "mp-tdc-24", menuId: "menu-thuc-don-chinh", productId: "product-du003", sortOrder: 24, isAvailable: true },
  { id: "mp-tdc-25", menuId: "menu-thuc-don-chinh", productId: "product-du004", sortOrder: 25, isAvailable: true },
  { id: "mp-tdc-26", menuId: "menu-thuc-don-chinh", productId: "product-du005", sortOrder: 26, isAvailable: true },
  { id: "mp-tdc-27", menuId: "menu-thuc-don-chinh", productId: "product-du006", sortOrder: 27, isAvailable: true },
  { id: "mp-tdc-28", menuId: "menu-thuc-don-chinh", productId: "product-du007", sortOrder: 28, isAvailable: true },
  { id: "mp-tdc-29", menuId: "menu-thuc-don-chinh", productId: "product-du008", sortOrder: 29, isAvailable: true },
  { id: "mp-tdc-30", menuId: "menu-thuc-don-chinh", productId: "product-du009", sortOrder: 30, isAvailable: true },
  { id: "mp-tdc-31", menuId: "menu-thuc-don-chinh", productId: "product-du010", sortOrder: 31, isAvailable: true },
  { id: "mp-tdc-32", menuId: "menu-thuc-don-chinh", productId: "product-du012", sortOrder: 32, isAvailable: true },
  { id: "mp-tdc-33", menuId: "menu-thuc-don-chinh", productId: "product-du011", sortOrder: 33, isAvailable: true },
  { id: "mp-tdc-34", menuId: "menu-thuc-don-chinh", productId: "product-du013", sortOrder: 34, isAvailable: true },
  { id: "mp-tdc-35", menuId: "menu-thuc-don-chinh", productId: "product-du014", sortOrder: 35, isAvailable: true },
  { id: "mp-tdc-36", menuId: "menu-thuc-don-chinh", productId: "product-du015", sortOrder: 36, isAvailable: true },
  { id: "mp-tdc-37", menuId: "menu-thuc-don-chinh", productId: "product-du016", sortOrder: 37, isAvailable: true },
  { id: "mp-tdc-38", menuId: "menu-thuc-don-chinh", productId: "product-du017", sortOrder: 38, isAvailable: true },
  { id: "mp-tdc-39", menuId: "menu-thuc-don-chinh", productId: "product-du018", sortOrder: 39, isAvailable: true },
  { id: "mp-tdc-40", menuId: "menu-thuc-don-chinh", productId: "product-du019", sortOrder: 40, isAvailable: true },
  { id: "mp-tdc-41", menuId: "menu-thuc-don-chinh", productId: "product-du020", sortOrder: 41, isAvailable: true },
  { id: "mp-tdc-42", menuId: "menu-thuc-don-chinh", productId: "product-du021", sortOrder: 42, isAvailable: true },
  { id: "mp-tdc-43", menuId: "menu-thuc-don-chinh", productId: "product-du022", sortOrder: 43, isAvailable: true },
  { id: "mp-tdc-44", menuId: "menu-thuc-don-chinh", productId: "product-dv001", sortOrder: 44, isAvailable: true },
  { id: "mp-tdc-45", menuId: "menu-thuc-don-chinh", productId: "product-dv002", sortOrder: 45, isAvailable: true },
  { id: "mp-tdc-46", menuId: "menu-thuc-don-chinh", productId: "product-dv003", sortOrder: 46, isAvailable: true },

  // ================= menu-mon-yeu-thich (12 món, trang chủ) =================
  { id: "mp-myt-01", menuId: "menu-mon-yeu-thich", productId: "product-bc005", sortOrder: 1, isAvailable: true },
  { id: "mp-myt-02", menuId: "menu-mon-yeu-thich", productId: "product-bc007", sortOrder: 2, isAvailable: true },
  { id: "mp-myt-03", menuId: "menu-mon-yeu-thich", productId: "product-mi003", sortOrder: 3, isAvailable: true },
  { id: "mp-myt-04", menuId: "menu-mon-yeu-thich", productId: "product-bc001", sortOrder: 4, isAvailable: true },
  { id: "mp-myt-05", menuId: "menu-mon-yeu-thich", productId: "product-bc002", sortOrder: 5, isAvailable: true },
  { id: "mp-myt-06", menuId: "menu-mon-yeu-thich", productId: "product-mi006", sortOrder: 6, isAvailable: true },
  { id: "mp-myt-07", menuId: "menu-mon-yeu-thich", productId: "product-tp001", sortOrder: 7, isAvailable: true },
  { id: "mp-myt-08", menuId: "menu-mon-yeu-thich", productId: "product-tp002", sortOrder: 8, isAvailable: true },
  { id: "mp-myt-09", menuId: "menu-mon-yeu-thich", productId: "product-tp003", sortOrder: 9, isAvailable: true },
  { id: "mp-myt-10", menuId: "menu-mon-yeu-thich", productId: "product-bc004", sortOrder: 10, isAvailable: true },
  { id: "mp-myt-11", menuId: "menu-mon-yeu-thich", productId: "product-bc006", sortOrder: 11, isAvailable: true },
  { id: "mp-myt-12", menuId: "menu-mon-yeu-thich", productId: "product-mi012", sortOrder: 12, isAvailable: true },

  // ================= menu-goi-y-them (5 món, section "Có thể bạn muốn dùng thêm" ở Cart Page) =================
  { id: "mp-gyt-01", menuId: "menu-goi-y-them", productId: "product-tp001", sortOrder: 1, isAvailable: true },
  { id: "mp-gyt-02", menuId: "menu-goi-y-them", productId: "product-tp002", sortOrder: 2, isAvailable: true },
  { id: "mp-gyt-03", menuId: "menu-goi-y-them", productId: "product-tp003", sortOrder: 3, isAvailable: true },
  { id: "mp-gyt-04", menuId: "menu-goi-y-them", productId: "product-du001", sortOrder: 4, isAvailable: true },
  { id: "mp-gyt-05", menuId: "menu-goi-y-them", productId: "product-du005", sortOrder: 5, isAvailable: true },
];
