// Import clsx để nối class có điều kiện gọn hơn.
import { clsx } from "clsx";

// Hàm cn giúp component truyền className linh hoạt mà không bị undefined/null.
export function cn(...inputs: (string | number | boolean | null | undefined)[]): string {
  // clsx tự bỏ qua giá trị false/null/undefined và ghép class hợp lệ.
  return clsx(inputs);
}
