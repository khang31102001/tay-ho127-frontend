/**
 * Chuẩn hóa response từ Route Handler nội bộ (app/api/**):
 * - Ném lỗi với message từ backend nếu request thất bại hoặc success=false.
 * - Trả về nhánh success:true đã narrow type khi thành công.
 *
 * Dùng chung cho mọi service gọi app/api/* (customer + admin) để tránh
 * lặp lại logic parse response giống hệt nhau ở từng service.
 */
export async function readApiResponse<TResponse extends { success: boolean; message: string }>(
  response: Response,
  fallbackMessage: string,
): Promise<Extract<TResponse, { success: true }>> {
  const result = (await response.json()) as TResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || fallbackMessage);
  }

  return result as Extract<TResponse, { success: true }>;
}
