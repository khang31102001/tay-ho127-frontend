/**
 * Chuẩn hóa chuỗi để tìm kiếm:
 * - Không phân biệt chữ hoa, chữ thường.
 * - Không phân biệt dấu tiếng Việt.
 *
 * Ví dụ:
 * "Bánh Cuốn" -> "banh cuon"
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
