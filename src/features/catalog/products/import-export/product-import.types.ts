/**
 * Shape 1 dòng sau khi parse CSV, trước khi map vào ManagedProduct.
 * Tách khỏi ManagedProduct vì cột CSV dùng categoryName (tên danh mục,
 * dễ sửa tay) thay vì categoryId, và không có mediaIds/rating/... (những
 * field site-display chưa có UI chỉnh sửa nào trong ProductEditor).
 */
export type ProductImportRow = {
  id?: string;
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  status: "active" | "inactive";
};
